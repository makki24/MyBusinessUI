// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import RolesScreen from "./screens/RolesScreen";
import AddRoleScreen from "./screens/AddRoleScreen";
import {RecoilRoot} from "recoil";
import { Provider as PaperProvider } from 'react-native-paper';
import EditRoleScreen from "./screens/EditRoleScreen";

const Stack = createStackNavigator();

const App = () => {
  return (
      <RecoilRoot>
          <PaperProvider>
              <NavigationContainer>
                <Stack.Navigator initialRouteName="Login">
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Home" component={HomeScreen} />
                  <Stack.Screen name="Roles" component={RolesScreen} />
                  <Stack.Screen name="AddRole" component={AddRoleScreen} />
                  <Stack.Screen name="EditRole" component={EditRoleScreen} />
                </Stack.Navigator>
              </NavigationContainer>
          </PaperProvider>
      </RecoilRoot>
  );
};

export default App;
