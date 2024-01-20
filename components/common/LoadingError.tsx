import { View, ActivityIndicator, Text } from 'react-native';
import commonStyles from "./commonStyles";
import React from "react";

const LoadingError = ({ isLoading, error }) => {
   return (
       <>
           {error && (
               <View style={commonStyles.errorContainer}>
                   <Text style={commonStyles.errorText}>{error}</Text>
               </View>
           )}
           {isLoading && (
               <View style={commonStyles.loadingContainer}>
                   <ActivityIndicator size="large" color="#0000ff" />
               </View>
           )}
       </>
   )
};

export default LoadingError;