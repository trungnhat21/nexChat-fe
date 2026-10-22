import { Route,Routes } from "react-router";
import LoginPgae from "../page/login";
import HomePage from "../page/home";
import ProfilePage from "../page/profile";
import SavedPage from "../page/saved";
import RegisterPage from "../page/register";

export default function AppRouters(){
    return(
        <Routes>
            <Route path="/" element={<LoginPgae/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/home" element={<HomePage/>}/>
            <Route path="/posts/:postId" element={<HomePage/>}/>
            <Route path="/saved" element={<SavedPage/>}/>
            <Route path="/profile" element={<ProfilePage/>}/>
            <Route path="/profile/:userId" element={<ProfilePage/>}/>
        </Routes>
    )
}
