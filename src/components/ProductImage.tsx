// components/ProductImage.tsx
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

interface ProductImageProps {
  uri: string | null | undefined;
  width?: number;
  height?: number;
}

export const ProductImage = ({
  uri,
  width = 120,
  height = 120,
}: ProductImageProps) => {
  return (
    <View style={[styles.imageWrapper, { width, height }]}>
      <Image
        source={
          uri ? { uri } : require("@assets/images/placeholder.png") // ✅ Local fallback if uri is null
        }
        placeholder={require("@assets/images/loading.png")} // ✅ Placeholder while loading
        style={[styles.image, { width, height }]}
        contentFit="cover"
        transition={300} // ✅ Smooth fade-in transition
        cachePolicy="disk" // ✅ Persistent caching
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageWrapper: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  image: {
    borderRadius: 12,
  },
});
