import { useEffect, useState } from "react";

const SecondComp = () => {
    const [screenSize, stateCount] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    const updateSize = () => {
        stateCount({
            width:window.innerWidth,
            height: window.innerHeight
        })
    };
    useEffect(()=>{
        window.addEventListener("resize", updateSize);
        return ()=>{window.removeEventListener("resize", updateSize)}
    },[]);
    return (
        <div>
            <p>width: {screenSize.width}</p>
            <p>height: {screenSize.height}</p>
        </div>
    );
}

export default SecondComp;