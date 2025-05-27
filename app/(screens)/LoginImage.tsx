import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../utils/api"; // Import API methods
import CustomHeader from "@/components/CustomHeader";
import { getAuthData, getAuthValue, storeAuthData } from "@/utils/storage";

const LoginImage = () => {
  const [image, setImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [promoterId, setPromoterId] = useState("");

  const router = useRouter();

  const fetchPromoterId = async () => {
    const storedPromoterId = await getAuthValue("promoterId");
    setPromoterId(storedPromoterId);
  };

  useEffect(() => {
    fetchPromoterId();
  }, []);

  // Handle taking a photo with front camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Error", "Camera permission is required to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.7,
      cameraType: ImagePicker.CameraType.front, // Force front camera
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  // Handle submit (uploads image)
  const handleSubmit = () => {
    if (!image) {
      Alert.alert("Error", "Please take a login Image.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();

    formData.append("image", {
      uri: image,
      name: `login_photo_${Date.now()}.jpg`,
      type: "image/jpeg",
    } as any);

    formData.append("promoterId", promoterId);
    // formData.append("type", "login");

    console.log("formData---", formData);
    const formDataObj = Object.fromEntries(formData.entries());
    console.log("formData as object:", formDataObj);

    api
      .loginImage(formData)
      .then(async (response) => {
        console.log("Login Image Response:", {
          success: response.success,
          message: response.message,
          data: response.newImage.id,
        });

        if (response.success) {
          // Get existing auth data
          const existingAuthData = await getAuthData();

          // Store new auth data with sessionId while preserving existing data
          const updatedAuthData = {
            ...existingAuthData,
            loginImageId: response.newImage.id,
          };

          console.log("updatedAuthData---", updatedAuthData);

          await storeAuthData(updatedAuthData);

          Alert.alert("Success", "Login Image uploaded successfully!");
          router.replace("/dashboard");
        } else {
          Alert.alert(
            "Error",
            response.message || "Failed to upload login Image."
          );
        }
      })
      .catch((error) => {
        console.error("Login Image Error:", error);
        Alert.alert("Error", error.message || "Something went wrong.");
      })
      .finally(() => setIsLoading(false));
    // console.log("Uploaded Login Image");
    // router.replace("/dashboard");
  };

  // Remove selected image
  const removeImage = () => {
    setImage("");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* <CustomHeader /> */}

      {/* Main Card */}
      <View className="bg-white mx-4 my-4 rounded-3xl shadow-md p-6">
        <View className="mx-4 my-4 rounded-3xl p-6">
          {/* Header */}
          <Text className="text-2xl font-bold text-center text-primary mb-6">
            Login Image
          </Text>

          {/* Image Preview Section */}
          <View className="items-center justify-center mb-6">
            {image ? (
              <View className="relative">
                <Image
                  source={{ uri: image }}
                  className="w-64 h-64 rounded-xl border border-gray-300"
                />
                {/* Cross icon to remove image */}
                <TouchableOpacity
                  onPress={removeImage}
                  className="absolute top-2 right-2 bg-white p-1 rounded-full"
                >
                  <Ionicons name="close-circle" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="w-64 h-64 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50">
                <Ionicons name="person" size={64} color="#ccc" />
                <Text className="text-gray-400 mt-2">No Image selected</Text>
              </View>
            )}
          </View>

          {/* Take Photo Button */}
          <TouchableOpacity
            onPress={takePhoto}
            className="w-full py-4 rounded-xl bg-blue-500 items-center justify-center flex-row space-x-2 shadow-md mb-4"
          >
            <Ionicons name="camera" size={24} color="#fff" />
            <Text className="text-white text-lg font-semibold">
              {image ? "Retake Photo" : "Take Login Photo"}
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading || !image}
            className={`w-full py-4 rounded-xl ${
              image ? "bg-primary" : "bg-gray-300"
            } items-center shadow-md`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">Submit</Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          {/* <TouchableOpacity
            onPress={() => router.back()}
            className="w-full py-4 rounded-xl bg-white border border-gray-300 items-center mt-4 shadow-sm"
          >
            <Text className="text-gray-700 text-lg font-medium">Cancel</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginImage;
