// App.tsx
import React, { useEffect } from "react";
import { View, Image, TouchableOpacity, useColorScheme } from "react-native";
import {
  NavigationContainer,
  RouteProp,
  useRoute,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ParamListBase,
  DrawerNavigationState,
} from "@react-navigation/native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import {
  Caption,
  IconButton,
  Provider as PaperProvider,
  Avatar,
  adaptNavigationTheme,
  MD3LightTheme,
  MD3DarkTheme,
  Text,
} from "react-native-paper";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import RolesScreen from "./screens/RolesScreen";
import AddRoleScreen from "./screens/AddRoleScreen";
import EditRoleScreen from "./screens/EditRoleScreen";
import AddExpenseTypeScreen from "./screens/AddExpenseTypeScreen";
import ExpenseTypesScreen from "./screens/ExpenseTypesScreen";
import ExpenseScreen from "./screens/ExpenseScreen";
import AddExpenseScreen from "./screens/AddExpenseScreen";
import {
  expenseTypesState,
  rolesState,
  tagsState,
  usersState,
  userState,
} from "./recoil/atom";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DEFAULT_AVATAR_URL } from "./constants/mybusiness.constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddLoanClearTransaction from "./screens/AddLoanClearTransaction";
import TagsScreen from "./screens/TagsScreen";
import AddTagScreen from "./screens/AddTagScreen";
import WorkTypeScreen from "./screens/WorkTypeScreen";
import AddWorkTypeScreen from "./screens/AddWorkTypeScreen";
import WorksScreen from "./screens/WorksScreen";
import AddWorkScreen from "./screens/AddWorkScreen";
import UserService from "./services/UserService";
import TagsService from "./services/TagsService";
import SaleScreen from "./screens/SalesScreen";
import AddSaleScreen from "./screens/AddSaleScreen";
import ContributionScreen from "./screens/ContributionScreen";
import AddContributionScreen from "./screens/AddContributionScreen";
import AddUserScreen from "./screens/AddUserScreen";
import UsersScreen from "./screens/UsersScreen";
import RolesService from "./services/RolesService";
import ReportScreen from "./screens/ReportScreen";
import UserReportScreen from "./screens/UserReportScreen";
import LoanTransactionScreen from "./screens/LoanTransactionsScreen";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { User } from "./types";
import AdminScreen from "./screens/AdminScreen";
import commonStyles from "./src/styles/commonStyles";
import {
  CONTAINER_PADDING,
  DRAWER_CONTENT_MARGIN,
  HEADING_SIZE,
  MAIN_PROFILE_PIC,
  UI_ELEMENTS_GAP,
} from "./src/styles/constants";
import ExpenseTypesService from "./services/ExpenseTypesService";
import type {
  DrawerDescriptorMap,
  DrawerNavigationHelpers,
} from "@react-navigation/drawer/src/types";
import ImpersonationScreen from "./screens/ImpersonationScreen";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

interface RouteParams {
  title?: string;
}

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

const RoleStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="Roles" component={RolesScreen} />
      <Stack.Screen name="AddRole" component={AddRoleScreen} />
      <Stack.Screen name="EditRole" component={EditRoleScreen} />
    </Stack.Navigator>
  );
};

const ExpenseStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="Expenses" component={ExpenseScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
    </Stack.Navigator>
  );
};

const ExpenseTypeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="ExpenseTypes" component={ExpenseTypesScreen} />
      <Stack.Screen name="AddExpenseType" component={AddExpenseTypeScreen} />
    </Stack.Navigator>
  );
};

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AdminScreen" component={AdminScreen} />
      <Stack.Screen
        name="ImpersonationScreen"
        component={ImpersonationScreen}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen
        name="ManageAmounts"
        component={AddLoanClearTransaction}
        options={{ title: "Title", headerTitle: "title" }}
      />
      <Stack.Screen
        name="LoanTransactionList"
        component={LoanTransactionScreen}
      />
      <Stack.Screen name="ContributionScreen" component={ContributionScreen} />
      <Stack.Screen name="AddContribution" component={AddContributionScreen} />
    </Stack.Navigator>
  );
};

const TagsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="ManageTags" component={TagsScreen} />
      <Stack.Screen name="AddTag" component={AddTagScreen} />
    </Stack.Navigator>
  );
};

const WorkStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="Work" component={WorksScreen} />
      <Stack.Screen name="AddWork" component={AddWorkScreen} />
      <Stack.Screen name="WorkType" component={WorkTypeScreen} />
      <Stack.Screen name="AddWorkType" component={AddWorkTypeScreen} />
    </Stack.Navigator>
  );
};

const SaleStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="Sale" component={SaleScreen} />
      <Stack.Screen name="AddSale" component={AddSaleScreen} />
    </Stack.Navigator>
  );
};

const UsersStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="Users" component={UsersScreen} />
      <Stack.Screen name="AddUser" component={AddUserScreen} />
      <Stack.Screen name="UserReport" component={UserReportScreen} />
    </Stack.Navigator>
  );
};

const ReportStack = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
      <Stack.Screen name="Report" component={ReportScreen} />
    </Stack.Navigator>
  );
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
    <NavigationContainer theme={paperTheme}>
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

const App = () => {
  return (
    <GestureHandlerRootView style={{ height: "100%", width: "100%" }}>
      <RecoilRoot>
        <PaperProvider>
          <BottomSheetModalProvider>
            <AppContent />
          </BottomSheetModalProvider>
        </PaperProvider>
      </RecoilRoot>
    </GestureHandlerRootView>
  );
};

interface CustomDrawerContentProps {
  navigation: DrawerNavigationHelpers;
  state: DrawerNavigationState<ParamListBase>; // Adjust this type based on your navigation stack
  descriptors: DrawerDescriptorMap;
  userInfo: User;
}

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = ({
  navigation,
  state,
  descriptors,
  ...props
}) => {
  const userInfo = props.userInfo as User;
  const [_, setUserInfo] = useRecoilState(userState);

  const toggleDrawer = () => {
    navigation.toggleDrawer();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("@token");
    setUserInfo(null);
  };

  const navigateToManageAmounts = () => {
    navigation.navigate("ProfileStack", {
      screen: "LoanTransactionList",
      params: { title: "Loan Clear Transactions" },
    });
  };

  const navigateToContributionScreen = () => {
    navigation.navigate("ProfileStack", {
      screen: "ContributionScreen",
      params: { title: "My Contributions" },
    });
  };

  const navigateToEditAccount = () => {
    navigation.navigate("UsersStack", {
      screen: "AddUser",
      params: {
        title: `Edit User: ${userInfo.name}`,
        user: userInfo,
        isEditMode: true,
      },
    });
  };

  return (
    <DrawerContentScrollView {...props}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginLeft: DRAWER_CONTENT_MARGIN,
        }}
      >
        <TouchableOpacity onPress={toggleDrawer}>
          <Avatar.Image
            source={{ uri: userInfo?.picture || DEFAULT_AVATAR_URL }}
            size={MAIN_PROFILE_PIC}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateToEditAccount}>
          <IconButton icon="account-edit" size={MAIN_PROFILE_PIC / 2} />
        </TouchableOpacity>

        <View
          style={{ marginLeft: "auto", marginRight: DRAWER_CONTENT_MARGIN }}
        >
          <TouchableOpacity onPress={navigateToContributionScreen}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconButton icon="wallet" style={{ margin: 0, padding: 0 }} />
              <Caption>{userInfo?.amountHolding}</Caption>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToManageAmounts}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconButton
                icon="hand-extended"
                style={{ margin: 0, padding: 0 }}
              />
              <Caption>{userInfo?.amountToReceive}</Caption>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <DrawerItemList
        state={state}
        descriptors={descriptors}
        navigation={navigation}
        {...props}
      />
      <TouchableOpacity onPress={handleLogout}>
        <View
          style={{
            padding: CONTAINER_PADDING,
            borderTopWidth: 1,
            borderTopColor: "#ccc",
          }}
        >
          <Text>Logout</Text>
        </View>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

const CustomHeader = () => {
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const userInfo = useRecoilValue(userState);
  const title = route.params?.title || route.name;
  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View
      style={{
        ...commonStyles.row,
        alignItems: "center",
        padding: UI_ELEMENTS_GAP,
        paddingBottom: 0,
      }}
    >
      <View style={commonStyles.simpleRow}>
        {navigation.canGoBack() ? (
          <IconButton
            icon="arrow-left"
            size={HEADING_SIZE}
            onPress={() => goBack()}
          />
        ) : null}
        <Text style={{ fontSize: HEADING_SIZE }}>{title ?? route.name}</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
        <Image
          source={{ uri: userInfo?.picture || DEFAULT_AVATAR_URL }}
          style={{
            width: HEADING_SIZE * 2,
            height: HEADING_SIZE * 2,
            borderRadius: HEADING_SIZE,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default App;
