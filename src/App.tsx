import './App.css';
import {RouterProvider} from "react-router";
import {createBrowserRouter} from "react-router-dom";
import HomeScreen from "./screens/Home.tsx";
import {QueryClient, QueryClientProvider} from "react-query";
import RulesScreen from "./screens/Rules.tsx";
import {withAuthenticationRequired} from "@auth0/auth0-react";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const router = createBrowserRouter([
    {
        path: "/",
        element: <HomeScreen/>
    },
    {
        path: '/rules',
        element: <RulesScreen/>
    }
]);

export const queryClient = new QueryClient()
const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router}/>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable />
        </QueryClientProvider>
    );
}

// To enable Auth0 integration change the following line
//export default App;
// for this one:
export default withAuthenticationRequired(App);
