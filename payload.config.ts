import path from "path";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { en } from "payload/i18n/en";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { CartCollection } from "@/collections/cart";
import { CatalogCollection } from "@/collections/catalog";
import { MediaCollection } from "@/collections/media";
import { UserCollection } from "@/collections/users";
import { TeamCollection } from "@/collections/team";
import { ReelCollection } from "@/collections/reels";
import { CategoriesCollection } from "@/collections/categories";
import { PromosCollection } from "@/collections/promos";
import { OriginalsCollection } from "@/collections/originals";
import Logo from "@/components/Logo";
import { RequirementsCollection } from "@/collections/requirements";
import { FilesDownloadCollection } from "@/collections/filesDownload";
import Icon from "@/components/Icon";
import { VideoCollection } from "@/collections/videos";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  //editor: slateEditor({}),
  editor: lexicalEditor(),
  collections: [
    UserCollection,
    PromosCollection,
    CartCollection,
    CatalogCollection,
    CategoriesCollection,
    TeamCollection,
    ReelCollection,
    OriginalsCollection,
    RequirementsCollection,
    FilesDownloadCollection,
    MediaCollection,
    VideoCollection,
  ],
  secret: process.env.PAYLOAD_SECRET ?? "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    // El schema se maneja con migraciones (src/migrations), no con dev push.
    // Necesario porque el snapshot drizzle-kit con el export "/payload" ya no
    // existe en npm; con push:false se evita esa dependencia.
    push: false,
    pool: {
      connectionString: process.env.POSTGRES_URI ?? "",
    },
  }),
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: "media",
        },
      },
      bucket: process.env.S3_BUCKET ?? "",
      config: {
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
        },
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT,
      },
    }),
  ],
  //db: mongooseAdapter({
  //url: process.env.MONGODB_URI || '',
  //}),

  /**
   * Payload can now accept specific translations from 'payload/i18n/en'
   * This is completely optional and will default to English if not provided
   */
  i18n: {
    supportedLanguages: { en },
  },

  admin: {
    components: {
      graphics: {
        Logo: Logo,
        Icon: Icon,
      },
    },
  },
  async onInit(payload) {
    const existingUsers = await payload.find({
      collection: "users",
      limit: 1,
    });

    if (existingUsers.docs.length === 0) {
      await payload.create({
        collection: "users",
        data: {
          email: "dev@payloadcms.com",
          password: "test",
        },
      });
    }
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.

  // This is temporary - we may make an adapter pattern
  // for this before reaching 3.0 stable
  sharp,
});
