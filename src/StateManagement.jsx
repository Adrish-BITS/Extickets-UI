import { useEffect, useState } from "react";
import './App.css';

const StateManagement = () =>{

    const[city, setCity] = useState("Hyderabad");  
    useEffect(()=>{
        if(city==="Hyderabad")
            setCity("Bangalore")
        else if(city === "Bangalore")
            setCity("Goa")
    },[city ])

    return (
        <div>
            <p>{city}</p>
        </div>
    );
    
}

export default StateManagement;