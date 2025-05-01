import React, { useState } from 'react';
import Login from './components/login'; // Assurez-vous que le chemin est correct
import DeliveryForm from './components/DeliveryForm'; // Assurez-vous que le chemin est correct

const App = () => {
const [showDeliveryForm, setShowDeliveryForm] = useState(false);

const handleLoginSuccess = () => {
    setShowDeliveryForm(true);
};
return (
    <div className="app-container">
        {!showDeliveryForm ? (
            <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
            <DeliveryForm />
        )}
    </div>
);
};

export default App;