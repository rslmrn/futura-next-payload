import { generateSlug } from "@/app/(app)/lib/slugify/slugify";
import { revalidatePage } from "@/payloadSyncData/payloadSyncData";
import { CollectionConfig } from "payload";

export const CatalogCollection: CollectionConfig = {
  slug: "catalog",
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  hooks: {
    beforeValidate: [
      ({ data }: any) => {
        return generateSlug(data);
      },
    ],
    beforeDelete: [
      // El campo `catalogItem` del carrito es `required` (columna NOT NULL),
      // pero Payload crea su foreign key con ON DELETE SET NULL. Al borrar un
      // producto que está en algún carrito, Postgres intenta poner NULL y viola
      // el NOT NULL -> error 500. Aquí limpiamos esas referencias primero, en la
      // misma transacción del delete.
      async ({ req, id }) => {
        const carts = await req.payload.find({
          collection: "cart",
          depth: 0,
          limit: 1000,
          where: { "items.catalogItem": { equals: id } },
          req,
        });

        for (const cart of carts.docs) {
          const remainingItems = (cart.items ?? []).filter((item: any) => {
            const ci = item?.catalogItem;
            const ciId = ci && typeof ci === "object" ? ci.id : ci;
            return String(ciId) !== String(id);
          });

          await req.payload.update({
            collection: "cart",
            id: cart.id,
            data: { items: remainingItems as any },
            req,
          });
        }
      },
    ],
    afterChange: [
      ({ doc }) => {
        revalidatePage("catalog");
      },
    ],
    afterDelete: [
      () => {
        revalidatePage("catalog");
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      required: true,
    },
    {
      name: "body",
      type: "richText",
      required: false,
    },
    {
      name: "price",
      type: "number",
      required: true,
    },
    {
      name: "maxQuantity",
      type: "number",
      required: true,
    },
    {
      name: "maxDays",
      type: "number",
      required: true,
    },
    {
      name: "categories",
      label: "Categories for this product",
      type: "relationship",
      relationTo: "categories",
      hasMany: true,
      required: true,
    },
    {
      name: "mainImage",
      type: "upload",
      relationTo: "media",
      required: true,
    },
  ],
};
