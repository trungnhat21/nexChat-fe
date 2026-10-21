import { Route,Routes } from "react-router";
import LoginPgae from "../page/login";
import HomePage from "../page/home";

export default function AppRouters(){
    return(
        <Routes>
            <Route path="/" element={<LoginPgae/>}/>
            <Route path="/home" element={<HomePage/>}/>
        </Routes>
    )
}
