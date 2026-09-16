import { Route,Routes } from "react-router";
import LoginPgae from "../page/Login";

export default function AppRouters(){
    return(
        <Routes>
            <Route path="/" element={<LoginPgae/>}/>
        </Routes>
    )
}