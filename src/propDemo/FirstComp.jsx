const FirstComp = (props) => {
    const{name, city, age, phoneNo} = props.dynamicData1
    return (
        <div>
            <div>Name : {name}</div>
            <div>Age : {age}</div>
            <div>City : {city}</div>
            <div>Phone no : {phoneNo}</div>
        </div>
    );
}

export default FirstComp;