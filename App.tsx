// App.tsx
import React, {useEffect} from 'react';
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
import {rolesState, tagsState, usersState, userState} from "./recoil/atom";
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import {DEFAULT_AVATAR_URL} from "./constants/mybusiness.constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ManageAmountsScreen from "./screens/ManageAmountsScreen";
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
            <Stack.Screen name="ContributionScreen" component={ContributionScreen}/>
            <Stack.Screen name="AddContribution" component={AddContributionScreen}/>

        </Stack.Navigator>
    );
};

const TagsStack = () => {
    return (
        <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
            <Stack.Screen name="ManageTags" component={TagsScreen}/>
            <Stack.Screen name="AddTag" component={AddTagScreen} />
        </Stack.Navigator>
    );
};

const WorkStack = () => {
    return (
        <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
            <Stack.Screen name="Work" component={WorksScreen}/>
            <Stack.Screen name="AddWork" component={AddWorkScreen} />
            <Stack.Screen name="WorkType" component={WorkTypeScreen}/>
            <Stack.Screen name="AddWorkType" component={AddWorkTypeScreen} />
        </Stack.Navigator>
    );
};

const SaleStack = () => {
    return (
        <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
            <Stack.Screen name="Sale" component={SaleScreen}/>
            <Stack.Screen name="AddSale" component={AddSaleScreen} />
        </Stack.Navigator>
    );
};

const UsersStack = () => {
    return (
        <Stack.Navigator screenOptions={{ header: () => <CustomHeader /> }}>
            <Stack.Screen name="Users" component={UsersScreen} />
            <Stack.Screen name="AddUser" component={AddUserScreen}/>
            <Stack.Screen name="UserReport" component={UserReportScreen}/>
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
    const [users, setUsers] = useRecoilState(usersState);
    const [tags, setTags] = useRecoilState(tagsState);
    const [roles, setRoles] = useRecoilState(rolesState);

    const fetchUsers = async () => {
        try {
            const fetchedUsers = await UserService.getUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchTags = async () => {
        try {
            const fetchedTags = await TagsService.getTags();
            setTags(fetchedTags)
        } catch (error) {
            console.error('Error fetching tags:', error);

        }
    };

    const fetchRoles = async () => {
        try {
            const fetchedRoles = await RolesService.getRoles();
            setRoles(fetchedRoles)
        } catch (error) {
            console.error('Error fetching roles:', error);

        }
    };

    useEffect(() => {
        fetchUsers();
        fetchTags();
        fetchRoles();
    }, [userInfo]);


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
                    <Drawer.Screen options={{ headerShown: false, drawerLabel: 'Manage profile',drawerItemStyle: { height: 0 }}} name="ProfileStack" component={ProfileStack} />
                    <Drawer.Screen options={{ headerShown: false, drawerLabel: 'Roles' }} name="RolesStack" component={RoleStack} />
                    <Drawer.Screen options={{ headerShown: false, drawerLabel: 'Expenses' }} name="ExpenseStack" component={ExpenseStack} />
                    <Drawer.Screen options={{ headerShown: false, drawerLabel: 'Expense Types' }} name="ExpenseTypeStack" component={ExpenseTypeStack} />
                    <Drawer.Screen options={{ headerShown: false, drawerLabel: 'Manage tags' }} name="TagsStack" component={TagsStack} />
                    <Drawer.Screen options={{ headerShown: false, drawerLabel: 'Work' }} name="WorkStack" component={WorkStack} />
                    <Drawer.Screen options={{ headerShown: false, drawerLabel: 'Sale' }} name="SaleStack" component={SaleStack} />
                    <Drawer.Screen options={{ headerShown: false, drawerLabel: 'Users' }} name="UsersStack" component={UsersStack} />
                    <Drawer.Screen options={{ headerShown: false, drawerLabel: 'Report by Tags' }} name="ReportStack" component={ReportStack} />
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
    }

    const navigateToContributionScreen = () => {
        navigation.navigate('ProfileStack', { screen: 'ContributionScreen', params: { title: 'My Contributions' }})
    };

    const navigateToEditAccount = () => {
        navigation.navigate('UsersStack', {
            screen: 'AddUser',
            params: { title: `Edit User: ${userInfo.username}`, user: userInfo, isEditMode: true },
        });
    }

    return (
        <DrawerContentScrollView {...props}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                <TouchableOpacity onPress={toggleDrawer}>
                    <Avatar.Image source={{ uri: userInfo?.picture || DEFAULT_AVATAR_URL }} size={60} />
                </TouchableOpacity>
                <TouchableOpacity onPress={navigateToEditAccount}>
                    <IconButton icon="account-edit" size={30} />
                </TouchableOpacity>

                <View style={{ marginLeft: 'auto', marginRight: 10 }}>
                    <TouchableOpacity onPress={navigateToContributionScreen}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <IconButton icon="wallet" style={{ margin: 0, padding: 0 }}/>
                            <Caption>{userInfo?.amountHolding}</Caption>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={navigateToManageAmounts}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <IconButton icon="hand-extended" style={{ margin: 0, padding: 0, }}/>
                            <Caption>{userInfo?.amountToReceive}</Caption>
                        </View>
                    </TouchableOpacity>
                </View>
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
