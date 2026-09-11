import { Route,Routes } from "react-router";
import HomePage from "../page/HomePage";

export default function AppRouters(){
    return(
        <Routes>
            <Route path="/" element={<HomePage/>}/>
        </Routes>
    )
}