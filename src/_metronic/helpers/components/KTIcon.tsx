import React from "react";

//khai báo kiểu dữ liệu cho props, nó sẽ nhận vào 1 chuỗi
type Props ={
    iconName: string
    className?: string
    iconType?: "duotone" | "solid" | "outline"
}
//tạo comopent, React.FC<Props> là 1 React Componet và props của nó phải tuân theo Props
// {iconName} : là destructuring
const KTIcon: React.FC<Props> = ({iconName, className = "", iconType = "outline"}) =>{
    return(
        <i className={`ki-${iconType} ki-${iconName} ${className}`}></i>
    )
}
export {KTIcon}