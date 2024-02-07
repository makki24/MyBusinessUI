import {View, ActivityIndicator, useColorScheme} from 'react-native';
import commonStyles from "./commonStyles";
import React from "react";
import {MD3DarkTheme, MD3LightTheme, Text} from "react-native-paper";

const LoadingError = ({ isLoading, error }) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;


    return (
       <>
           {error && (
               <View style={{...commonStyles.errorContainer, backgroundColor: theme.colors.errorContainer}}>
                   <Text style={{color: theme.colors.error}}>{error}</Text>
               </View>
           )}
           {isLoading && (
               <View style={commonStyles.loadingContainer}>
                   <ActivityIndicator size="large" color={theme.colors.primary} animating={true} />
               </View>
           )}
       </>
   )
};

export default LoadingError;