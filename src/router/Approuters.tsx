import { Route,Routes } from "react-router";
import LoginPgae from "../page/login";
import HomePage from "../page/home";
import ProfilePage from "../page/profile";
import SavedPage from "../page/saved";
import RegisterPage from "../page/register";
import MessagesPage from "../page/messages";
import SearchPage from "../page/search";
import FriendsPage from "../page/friends";

export default function AppRouters(){
    return(
        <Routes>
            <Route path="/" element={<LoginPgae/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/home" element={<HomePage/>}/>
            <Route path="/posts/:postId" element={<HomePage/>}/>
            <Route path="/saved" element={<SavedPage/>}/>
            <Route path="/friends" element={<FriendsPage/>}/>
            <Route path="/messages" element={<MessagesPage/>}/>
            <Route path="/profile" element={<ProfilePage/>}/>
            <Route path="/profile/:userId" element={<ProfilePage/>}/>
            <Route path="/search" element={<SearchPage/>}/>
        </Routes>
    )
}
