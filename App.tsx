// App.tsx
import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import {NavigationContainer, RouteProp, useRoute} from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import {Caption, IconButton, Provider as PaperProvider,Avatar} from 'react-native-paper';
import {RecoilRoot, useRecoilState, useRecoilValue} from 'recoil';
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import ManageAmountsScreen from "./screens/ManageAmountsScreen";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

interface RouteParams {
    title?: string;
}

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

const ProfileStack = () => {
    return (
        <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
            <Stack.Screen name="ManageAmounts" component={ManageAmountsScreen}
                          options={{title: 'Title', headerTitle: 'title'}}
            />
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
                    <Drawer.Screen options={{ headerShown: false, drawerLabel: 'Manage profile' }} name="ProfileStack" component={ProfileStack} />
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
    const [_, setUserInfo] = useRecoilState(userState);

    const toggleDrawer = () => {
        navigation.toggleDrawer();
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('@token');
        setUserInfo(null);
    };

    const navigateToManageAmounts = () => {
        navigation.navigate('ProfileStack', { screen: 'ManageAmounts', params: { title: 'Manage Amounts' }})
    };

    return (
        <DrawerContentScrollView {...props}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                <TouchableOpacity onPress={toggleDrawer}>
                    <Avatar.Image source={{ uri: userInfo?.picture || DEFAULT_AVATAR_URL }} size={60} />
                </TouchableOpacity>

                <TouchableOpacity onPress={navigateToManageAmounts} style={{ marginLeft: 'auto', marginRight: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <IconButton icon="wallet" style={{ margin: 0, padding: 0 }}/>
                        <Caption>{userInfo?.amountHolding}</Caption>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <IconButton icon="hand-extended" style={{ margin: 0, padding: 0, }}/>
                        <Caption>{userInfo?.amountToReceive}</Caption>
                    </View>
                </TouchableOpacity>
            </View>
            <DrawerItemList state={state} descriptors={descriptors} navigation={navigation} {...props} />
            <TouchableOpacity onPress={handleLogout}>
                <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#ccc' }}>
                    <Text>Logout</Text>
                </View>
            </TouchableOpacity>
        </DrawerContentScrollView>
    );
};

const CustomHeader = () => {
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
    const userInfo = useRecoilValue(userState);
    const title = route.params?.title || route.name;
    const goBack = () => {
        navigation.goBack();
    };

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {navigation.canGoBack() ? (
                    <IconButton icon="arrow-left" size={20} onPress={() => goBack()} />
                ) : null}
                <Text style={{ fontSize: 20 }}>{title ?? route.name}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
                <Image source={{ uri: userInfo?.picture || DEFAULT_AVATAR_URL }}  style={{ width: 40, height: 40, borderRadius: 20 }} />
            </TouchableOpacity>
        </View>
    );
};

export default App;
