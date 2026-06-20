"use client";
import { Box, Text, useToast } from "@chakra-ui/react";
import { CatalogItemProps } from "./model";
import Image from "next/image";
import RentMeBadge from "./rentMeBadge";
import { formatPrice } from "@/app/(app)/utils/utils";
import { useStoreShoppingCart } from "@/app/(app)/lib/zustand/shoppingCartStore";
import {
  ModalKeys,
  useStoreZustand,
} from "@/app/(app)/lib/zustand/zustandStore";
import { useEffect, useState } from "react";
import { urlShoppingCart } from "@/app/(app)/lib/routes/routes";

const CatalogItem: React.FC<CatalogItemProps> = ({ item }) => {
  const { setHasCart, addToCart, hasCart, userId, shoppingBag } =
    useStoreShoppingCart();
  const { setModalOpen } = useStoreZustand();
  const toast = useToast();

  const [itemToAdd, setItemToAdd] = useState<any>(null);

  const modalName: ModalKeys = "shoppingBag";

  useEffect(() => {
    if (itemToAdd) updateCartUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemToAdd]);

  const handleAddtoCart = (item: any) => {
    addToCart(
      item,
      () => setModalOpen(modalName),
      () => handleToast()
    );
    hasCart && setItemToAdd(item);
    !hasCart && createCartUser(item);
  };

  const handleToast = () => {
    toast({
      position: "bottom-right",
      duration: 1500,
      render: () => (
        <Box
          color="white"
          p="10px"
          bg="white"
          border="1.4px solid white"
          borderRadius="4px"
          shadow="2xl"
          display="flex"
          alignItems="center"
          justifyContent="flex-start"
        >
          <Text variant="XSMEDIUM" color="black">
            {item.name} ya esta en tu bolsa
          </Text>
        </Box>
      ),
    });
  };

  const createCartUser = async (item: any) => {
    const response = await fetch(urlShoppingCart, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, item }),
    });

    if (!response.ok) {
      throw new Error("Failed to create shopping cart");
    }
    const data = await response.json();
    setHasCart(data?.hasCart);
  };

  const updateCartUser = async () => {
    const response = await fetch(urlShoppingCart, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, shoppingBag }),
    });

    if (!response.ok) {
      throw new Error("Failed to create shopping cart");
    }
  };

  return (
    <Box
      w="100%"
      display="grid"
      gridTemplateColumns="1fr"
      bg="white"
      borderRadius="8px"
      position="relative"
      className="catalog_item_container"
      onClick={() => handleAddtoCart(item)}
    >
      <Box
        key={item.mainImageUrl}
        w="100%"
        h={["320px", "420px", "320px", "320px", "380px"]}
        borderTopLeftRadius="8px"
        borderTopRightRadius="8px"
      >
        <Box w="100%" h="100%">
          <Image
            src={item.mainImageUrl}
            alt={item.name}
            width={200}
            height={380}
            placeholder="blur"
            blurDataURL={item.base64}
            unoptimized
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderTopRightRadius: "8px",
              borderTopLeftRadius: "8px",
            }}
          />
        </Box>
        <Box className="buyme_overlay" cursor="pointer">
          <Box
            mt={["-10%", "-10%", "-15%", "-15%", "-15%", "-15%"]}
            w={["50%", "40%", "50%", "60%", "60%", "60%"]}
            display="flex"
            alignItems="center"
            justifyContent="center"
            mixBlendMode="difference"
            userSelect="none"
            pointerEvents="none"
          >
            <RentMeBadge />
          </Box>
        </Box>
      </Box>
      <Box
        w="100%"
        p="15px 12px"
        borderTop="1.4px solid white"
        borderColor="black"
        display="grid"
        gridTemplateColumns="1fr auto"
      >
        <Box
          w="100%"
          display="flex"
          alignItems="center"
          justifyContent="flex-start"
        >
          <Text
            variant={[
              "SMMEDIUM",
              "SMMEDIUM",
              "SMMEDIUM",
              "SMMEDIUM",
              "SMMEDIUM",
            ]}
            color="#000"
            textTransform="uppercase"
            textDecor="ellipsis"
          >
            {item.name}
          </Text>
        </Box>
        <Box
          w="100%"
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Text
            variant={[
              "XSMEDIUM",
              "XSMEDIUM",
              "XSMEDIUM",
              "XSMEDIUM",
              "XSMEDIUM",
            ]}
            color="#000"
          >
            {formatPrice(item.price)}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default CatalogItem;
