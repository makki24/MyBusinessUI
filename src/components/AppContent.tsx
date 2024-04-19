import { useRecoilState, useRecoilValue } from "recoil";
import {
  expenseTypesState,
  rolesState,
  tagsState,
  usersState,
  userState,
} from "../../recoil/atom";
import UserService from "../../services/UserService";
import TagsService from "../../services/TagsService";
import RolesService from "../../services/RolesService";
import ExpenseTypesService from "../../services/ExpenseTypesService";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import CustomDrawerContent from "./common/CustomDrawerContent";
import HomeStack from "./home/HomeStack";
import ProfileStack from "./profile/ProfileStack";
import RoleStack from "./roles/RoleStack";
import ExpenseStack from "./expense/ExpenseStack";
import ExpenseTypeStack from "./expense/ExpenseTypeStack";
import TagsStack from "./tags/TagsStack";
import WorkStack from "./work/WorkStack";
import SaleStack from "./sale/SaleStack";
import UsersStack from "./users/UsersStack";
import ReportStack from "./report/ReportStack";
import LoginScreen from "../../screens/LoginScreen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  adaptNavigationTheme,
  MD3DarkTheme,
  MD3LightTheme,
} from "react-native-paper";
import * as Linking from "expo-linking";
import { Text } from "react-native-paper";
import { LinkingConfig } from "./config/linking.config";
import { getInitialURL, subscribe } from "../util/Navigation";

const prefix = Linking.createURL("/");

const Drawer = createDrawerNavigator();

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
  },
};
const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
  },
};

const AppContent = () => {
  const userInfo = useRecoilValue(userState);
  const [_users, setUsers] = useRecoilState(usersState);
  const [_tags, setTags] = useRecoilState(tagsState);
  const [_roles, setRoles] = useRecoilState(rolesState);
  const [_expenseTypes, setExpenseTypes] = useRecoilState(expenseTypesState);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await UserService.getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      error;
    }
  };

  const fetchTags = async () => {
    try {
      const fetchedTags = await TagsService.getTags();
      setTags(fetchedTags);
    } catch (error) {
      error;
    }
  };

  const fetchRoles = async () => {
    try {
      const fetchedRoles = await RolesService.getRoles();
      setRoles(fetchedRoles);
    } catch (error) {
      error;
    }
  };

  const fetchExpenseTypes = async () => {
    try {
      const fetchedExpenseTypes = await ExpenseTypesService.getExpenseTypes();
      setExpenseTypes(fetchedExpenseTypes);
    } catch (error) {
      error;
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTags();
    fetchRoles();
    fetchExpenseTypes();
  }, [userInfo]);

  const colorScheme = useColorScheme();

  const paperTheme =
    colorScheme === "dark" ? CombinedDarkTheme : CombinedDefaultTheme;

  return (
    <NavigationContainer
      theme={paperTheme}
      fallback={<Text>Loading...</Text>}
      linking={{
        prefixes: [prefix],
        config: LinkingConfig,
        getInitialURL,
        subscribe,
      }}
    >
      {userInfo ? (
        <Drawer.Navigator
          screenOptions={{
            drawerPosition: "right",
          }}
          initialRouteName="Home"
          drawerContent={(props) => (
            <CustomDrawerContent {...props} userInfo={userInfo} />
          )}
        >
          <Drawer.Screen
            options={{ headerShown: false, drawerLabel: "Home" }}
            name="HomeStack"
            component={HomeStack}
          />
          <Drawer.Screen
            options={{
              headerShown: false,
              drawerLabel: "Manage profile",
              drawerItemStyle: { height: 0 },
            }}
            name="ProfileStack"
            component={ProfileStack}
          />
          <Drawer.Screen
            options={{ headerShown: false, drawerLabel: "Roles" }}
            name="RolesStack"
            component={RoleStack}
          />
          <Drawer.Screen
            options={{ headerShown: false, drawerLabel: "Expenses" }}
            name="ExpenseStack"
            component={ExpenseStack}
          />
          <Drawer.Screen
            options={{ headerShown: false, drawerLabel: "Expense Types" }}
            name="ExpenseTypeStack"
            component={ExpenseTypeStack}
          />
          <Drawer.Screen
            options={{ headerShown: false, drawerLabel: "Manage tags" }}
            name="TagsStack"
            component={TagsStack}
          />
          <Drawer.Screen
            options={{ headerShown: false, drawerLabel: "Work" }}
            name="WorkStack"
            component={WorkStack}
          />
          <Drawer.Screen
            options={{ headerShown: false, drawerLabel: "Sale" }}
            name="SaleStack"
            component={SaleStack}
          />
          <Drawer.Screen
            options={{ headerShown: false, drawerLabel: "Users" }}
            name="UsersStack"
            component={UsersStack}
          />
          <Drawer.Screen
            options={{
              headerShown: false,
              drawerLabel: "Report by Tags",
              unmountOnBlur: true,
            }}
            name="ReportStack"
            component={ReportStack}
          />
          {/* Other screens */}
        </Drawer.Navigator>
      ) : (
        <Drawer.Navigator
          initialRouteName="Login"
          screenOptions={{ drawerPosition: "right" }}
          drawerContent={(props) => (
            <CustomDrawerContent {...props} userInfo={userInfo} />
          )}
        >
          <Drawer.Screen
            options={{ headerShown: false }}
            name="Login"
            component={LoginScreen}
          />
        </Drawer.Navigator>
      )}
    </NavigationContainer>
  );
};
export default AppContent;
