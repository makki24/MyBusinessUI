// App.tsx
import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer, useRoute } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { IconButton, Provider as PaperProvider } from 'react-native-paper';
import { RecoilRoot, useRecoilValue } from 'recoil';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import RolesScreen from "./screens/RolesScreen";
import AddRoleScreen from "./screens/AddRoleScreen";
import EditRoleScreen from "./screens/EditRoleScreen";
import AddExpenseTypeScreen from "./screens/AddExpenseTypeScreen";
import ExpenseTypesScreen from "./screens/ExpenseTypesScreen";
import ExpenseScreen from "./screens/ExpenseScreen";
import AddExpenseScreen from "./screens/AddExpenseScreen";
import { userState } from "./recoil/atom";
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import {DEFAULT_AVATAR_URL} from "./constants/mybusiness.constants";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

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
        </Stack.Navigator>
    );
};

const AppContent = () => {
    const userInfo = useRecoilValue(userState);

    return (
        <NavigationContainer>
            {userInfo ? (
                <Drawer.Navigator
                    screenOptions={{
                        drawerPosition: 'right',
                    }}
                    initialRouteName="Home" drawerContent={props => <CustomDrawerContent {...props} userInfo={userInfo} />}
                >
                    <Drawer.Screen options={{ headerShown: false, drawerLabel: 'Home' }} name="HomeStack" component={HomeStack} />
                    <Drawer.Screen options={{ headerShown: false, drawerLabel: 'Roles' }} name="RolesStack" component={RoleStack} />
                    <Drawer.Screen options={{ headerShown: false, drawerLabel: 'Expenses' }} name="ExpenseStack" component={ExpenseStack} />
                    <Drawer.Screen options={{ headerShown: false, drawerLabel: 'Expense Types' }} name="ExpenseTypeStack" component={ExpenseTypeStack} />
                    {/* Other screens */}
                </Drawer.Navigator>
            ) : (
                <Drawer.Navigator initialRouteName="Login" screenOptions={{ drawerPosition: 'right' }} drawerContent={props => <CustomDrawerContent {...props} userInfo={userInfo} />}>
                    <Drawer.Screen name="Login" component={LoginScreen} />
                </Drawer.Navigator>
            )}
        </NavigationContainer>
    );
};

const App = () => {
    return (
        <RecoilRoot>
            <PaperProvider>
                <AppContent />
            </PaperProvider>
        </RecoilRoot>
    );
};

const CustomDrawerContent = ({ navigation, state, descriptors, ...props }) => {
    const userInfo = props.userInfo;

    const toggleDrawer = () => {
        navigation.toggleDrawer();
    };

    return (
        <DrawerContentScrollView {...props}>
            <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                <TouchableOpacity onPress={toggleDrawer}>
                    <Image source={{ uri: userInfo?.picture || DEFAULT_AVATAR_URL }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                </TouchableOpacity>
            </View>
            <DrawerItemList state={state} descriptors={descriptors} navigation={navigation} {...props} />
        </DrawerContentScrollView>
    );
};

const CustomHeader = () => {
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const route = useRoute();
    const userInfo = useRecoilValue(userState);

    const goBack = () => {
        navigation.goBack();
    };

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {navigation.canGoBack() ? (
                    <IconButton icon="arrow-left" size={20} onPress={() => goBack()} />
                ) : null}
                <Text style={{ fontSize: 20 }}>{route.name}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
                <Image source={{ uri: userInfo?.picture || DEFAULT_AVATAR_URL }}  style={{ width: 40, height: 40, borderRadius: 20 }} />
            </TouchableOpacity>
        </View>
    );
};

export default App;
