import { format } from "date-fns";
import getBase64 from "../api/getBase64";
import { es } from "date-fns/locale";

export const formatPrice = (price: number) => {
  return price?.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const calculateTotalBagPrice = (shoppingBag: any) => {
  let totalBagPrice: number = 0;
  shoppingBag?.items?.forEach((item: any) => {
    totalBagPrice += item?.catalogItem?.price * item?.quantity;
  });

  return formatPrice(totalBagPrice);
};

export const calculateSinglePrice = (item: any) => {
  let singlePrice: number = 0;
  singlePrice += item?.catalogItem?.price * item?.quantity;

  return formatPrice(singlePrice);
};

const handleShoppingBagList = (shoppingBag: any) => {
  const messageList = shoppingBag?.items?.reduce(
    (result: any, item: any, idx: number) => {
      return `${result} *${item?.catalogItem?.name.toLocaleUpperCase()}* %0a •Unidades: ${
        item?.quantity
      } %0a •Subtotal: ${calculateSinglePrice(item)}mxn %0a`;
    },
    ""
  );
  return messageList;
};

export const handleWhatsAppMessage = (data: any, shoppingBag: any) => {
  const { name, projectName, locationCheckbox, location, date } = data;
  const messageName = name ? name.toLocaleUpperCase() : "DESCONOCIDO";
  const messageProjectName = !projectName
    ? "DESCONOCIDO"
    : projectName.toLocaleUpperCase();
  const messageCDMX = locationCheckbox ? "*CDMX - " : "";
  const messageSpecificLocation = location
    ? `${messageCDMX}${location.toLocaleUpperCase()}`
    : "DESCONOCIDO";
  const messageLocation = locationCheckbox
    ? ` ${messageSpecificLocation}`
    : messageSpecificLocation;
  const dateRange = date?.from
    ? date?.to
      ? `${format(date.from, "LLLL dd, y", { locale: es })} - ${format(
          date.to,
          "LLLL dd, y",
          { locale: es }
        )}`
      : format(date.from, "LLLL dd, y", { locale: es })
    : "DESCONOCIDO";
  const messageDate = dateRange.toLocaleUpperCase();
  const messageWhatsApp = `Hola *FVTVRA*🔥, mi nombre es: *${messageName}* estoy interesado en rentar equipo con ustedes para la(s) fecha(s): *${messageDate}* para el proyecto: *${messageProjectName}* que grabaremos en *${messageLocation}* esta es la lista de equipo que requiero: %0a%0a ${handleShoppingBagList(
    shoppingBag
  )} %0a *TOTAL DE COTIZACIÓN: ${calculateTotalBagPrice(
    shoppingBag
  )}mxn APROX. POR DÍA*`;
  return messageWhatsApp;
};

export const base64Placeholder =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/ANra4Pz8/ODf4M3O1ADj4+Ruc3YyLi1oYWEAW1pbAQUFAgECY2FjAI+Ok3JwdLGvtNjX3v2XGj2mfgmhAAAAAElFTkSuQmCC";

export const processData = async (catalog: any) => {
  return Promise.all(
    catalog.docs.map(async (item: any) => {
      const mainImageUrl = item.mainImage?.url;
      const base64 = mainImageUrl
        ? await getBase64(mainImageUrl)
        : base64Placeholder;
      item.mainImageUrl = mainImageUrl;
      item.base64 = base64;
      return item;
    })
  );
};

export const processDataCart = async (cart: any) => {
  return Promise.all(
    cart.docs[0]?.items?.map(async (item: any) => {
      const mainImageUrl = item.catalogItem?.mainImage?.url;
      const base64 = mainImageUrl
        ? await getBase64(mainImageUrl)
        : base64Placeholder;
      item.mainImageUrl = mainImageUrl;
      item.base64 = base64;
      return {
        id: cart.docs[0].id,
        user: cart.docs[0].user,
        items: item,
        createdAt: cart.docs[0].createdAt,
        updatedAt: cart.docs[0].updatedAt,
      };
    })
  );
};

export const processDataCrew = async (crew: any) => {
  return Promise.all(
    crew.docs.map(async (item: any) => {
      const mainImageUrl = item.mainImage?.url;
      const base64 = mainImageUrl
        ? await getBase64(mainImageUrl)
        : base64Placeholder;
      item.mainImageUrl = mainImageUrl;
      item.base64 = base64;
      return item;
    })
  );
};

export const processDataOriginals = async (originals: any) => {
  return Promise.all(
    originals.docs.map(async (item: any) => {
      item.originals = await Promise.all(
        item.originals.map(async (original: any) => {
          const mainImageUrl = original.thumbnail?.url;
          const base64 = mainImageUrl
            ? await getBase64(mainImageUrl)
            : base64Placeholder;

          return {
            ...original,
            mainImageUrl,
            base64,
          };
        })
      );

      // Return the modified item
      return item;
    })
  );
};
