import LoginPage from '../screens/credentialsScreen/LoginPage';

import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const Layout = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <>
        <Stack.Screen name="LoginPage" component={LoginPage} />
      </>
    </Stack.Navigator>
     
    
  )
}

export default Layout