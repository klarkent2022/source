import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import MapScreen from './MapScreen';
import HomeScreen from './HomeScreen';
import AddUserScreen from './AddUserScreen';
import UpdateUserScreen from './UpdateUserScreen';
import UpdateCardScreen from './UpdateCardScreen';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import AddPetScreen from './AddPetScreen';
import PetActivityScreen from './PetActivityScreen';
import PetVillageScreen from './PetVillageScreen';
import PetVillageFeedScreen from './PetVillageFeedScreen';
import CreateActivityScreen from './CreateActivityScreen';
import CreateMeetScreen from './CreateMeetScreen';
import PetInfoScreen from './PetInfoScreen';
import CreateFeedScreen from './CreateFeedScreen';
import MyInfoScreen from './MyInfoScreen';
import ActivityInfoScreen from './ActivityInfoScreen';
import ActivityChatScreen from './ActivityChatScreen';
import VillageChatScreen from './VillageChatScreen';
import MeetInfoScreen from './MeetInfoScreen';
import FeedInfoScreen from './FeedInfoScreen';
import RegisterAccScreen from './RegisterAccScreen';
import MyInterestScreen from './MyInterestScreen';
import SplashScreen from './SplashScreen';

const AuthStack = createStackNavigator(
    {
        MapScreen: {
            screen: MapScreen
        },
        SplashScreen: {
            screen: SplashScreen
        },
        HomeScreen: {
            screen: HomeScreen
        },
        AddUserScreen: {
            screen: AddUserScreen
        },
        UpdateUserScreen: {
            screen: UpdateUserScreen
        },
        UpdateCardScreen: {
            screen: UpdateCardScreen
        },
        MyInterestScreen: {
            screen: MyInterestScreen
        },
        LoginScreen: {
            screen: LoginScreen
        },
        SignupScreen: {
            screen: SignupScreen
        },
        AddPetScreen: {
            screen: AddPetScreen
        },
        PetActivityScreen: {
            screen: PetActivityScreen
        },
        PetVillageScreen: {
            screen: PetVillageScreen
        },
        PetVillageFeedScreen: {
            screen: PetVillageFeedScreen
        },
        CreateActivityScreen: {
            screen: CreateActivityScreen
        },
        CreateMeetScreen: {
            screen: CreateMeetScreen
        },
        PetInfoScreen: {
            screen: PetInfoScreen
        },
        MyInfoScreen: {
            screen: MyInfoScreen
        },
        ActivityInfoScreen: {
            screen: ActivityInfoScreen
        },
        VillageChatScreen: {
            screen: VillageChatScreen
        },
        ActivityChatScreen: {
            screen: ActivityChatScreen
        },
        MeetInfoScreen: {
            screen: MeetInfoScreen
        },
        FeedInfoScreen: {
            screen: FeedInfoScreen
        },
        CreateFeedScreen: {
            screen: CreateFeedScreen
        },
        RegisterAccScreen: {
            screen: RegisterAccScreen
        }
    },
    {
        initialRouteName: 'SplashScreen',
        headerMode        : 'none',
    }
);

// 최상단 네비게이터
const AppNavigator = createSwitchNavigator(
    {
        Auth: AuthStack
    },
    {
        initialRouteName: 'Auth',
    }
);

export default createAppContainer(AppNavigator);