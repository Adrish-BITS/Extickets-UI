
import './App.css';
import FirstComp from './propDemo/FirstComp';
import FourthComp from './propDemo/FourthComp';
import SecondComp from './propDemo/SecondComp';
import ThirdComp from './propDemo/ThirdComp';
import StateManagement from './StateManagement';

const dynamicData2 = {
  name:"Adrish",
  age:"2693",
  city:"Hyd",
  phoneNo: "7013325444"
  
}

function App() {
  return (
    <div className='container'>
       <SecondComp/>
    </div>
  );
}

export default App;
