// src/components/DeliveryForm.js
import React, { useState } from 'react';
import './DeliveryForm.css'; // Importez le fichier CSS
import MapComponent from './MapComponent'; // Assumez que vous avez un composant Map

const DeliveryForm = () => {
    const [departureWilaya, setDepartureWilaya] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [numVehicles, setNumVehicles] = useState('');
    const [numDrivers, setNumDrivers] = useState('');
    const [numClients, setNumClients] = useState(1);
    const [clients, setClients] = useState([{ name: '', wilaya: '' }]);
    const [products, setProducts] = useState([{ type: '', quantity: 1 }]);

    const handleNumClientsChange = (e) => {
        const newNumClients = parseInt(e.target.value);
        setNumClients(newNumClients);

        // Ajuster le tableau clients en fonction du nouveau nombre
        if (newNumClients > clients.length) {
            const diff = newNumClients - clients.length;
            const newClientsArray = [...clients];
            for (let i = 0; i < diff; i++) {
                newClientsArray.push({ name: '', wilaya: '' });
            }
            setClients(newClientsArray);
        } else if (newNumClients < clients.length) {
            setClients(clients.slice(0, newNumClients));
        }
    };

    const handleClientChange = (index, field, value) => {
        const updatedClients = [...clients];
        updatedClients[index][field] = value;
        setClients(updatedClients);
    };

    const handleAddProduct = () => {
        setProducts([...products, { type: '', quantity: 1 }]);
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...products];
        updatedProducts[index][field] = value;
        setProducts(updatedProducts);
    };

    const handleSubmit = () => {
        console.log('Détails de la livraison:', {
            departureWilaya,
            departureDate,
            numVehicles,
            numDrivers,
            clients,
            products,
        });
        // Dans une application réelle, vous enverriez ces données à votre backend
    };

    return (
        <div className="delivery-dashboard">
            <div className="map-container">
                <MapComponent
                    departureWilaya={departureWilaya}
                    clientWilaya={clients[0]?.wilaya} // Passe la wilaya du premier client (si elle existe)
                />
            </div>
            <div className="form-panel">
                <div className="header">
                    <h3>Système de Livraison - Algérie</h3>
                    <button className="logout-button">Déconnexion</button>
                </div>

                <div className="delivery-details">
                    <h4>Détails de la livraison</h4>
                    <div className="form-group">
                        <label htmlFor="departureWilaya">Wilaya de départ</label>
                        <select
                            id="departureWilaya"
                            value={departureWilaya}
                            onChange={(e) => setDepartureWilaya(e.target.value)}
                        >
                            <option value="">Sélectionner une wilaya</option>
                            <option value="Adrar">Adrar</option>
                            <option value="Chlef">Chlef</option>
                            <option value="Laghouat">Laghouat</option>
                            <option value="Oum El Bouaghi">Oum El Bouaghi</option>
                            <option value="Batna">Batna</option>
                            <option value="Béjaïa">Béjaïa</option>
                            <option value="Biskra">Biskra</option>
                            <option value="Béchar">Béchar</option>
                            <option value="Blida">Blida</option>
                            <option value="Bouira">Bouira</option>
                            <option value="Tlemcen">Tlemcen</option>
                            <option value="Tébessa">Tébessa</option>
                            <option value="Mostaganem">Mostaganem</option>
                            <option value="Sétif">Sétif</option>
                            <option value="Saïda">Saïda</option>
                            <option value="Skikda">Skikda</option>
                            <option value="Sidi Bel Abbès">Sidi Bel Abbès</option>
                            <option value="Annaba">Annaba</option>
                            <option value="Guelma">Guelma</option>
                            <option value="Constantine">Constantine</option>
                            <option value="Médéa">Médéa</option>
                            <option value="Mascara">Mascara</option>
                            <option value="Ouargla">Ouargla</option>
                            <option value="El Bayadh">El Bayadh</option>
                            <option value="Illizi">Illizi</option>
                            <option value="Bordj Bou Arréridj">Bordj Bou Arréridj</option>
                            <option value="Boumerdès">Boumerdès</option>
                            <option value="El Tarf">El Tarf</option>
                            <option value="Tindouf">Tindouf</option>
                            <option value="Tissemsilt">Tissemsilt</option>
                            <option value="El Oued">El Oued</option>
                            <option value="Khenchela">Khenchela</option>
                            <option value="Souk Ahras">Souk Ahras</option>
                            <option value="Tipaza">Tipaza</option>
                            <option value="Mila">Mila</option>
                            <option value="Aïn Defla">Aïn Defla</option>
                            <option value="Naâma">Naâma</option>
                            <option value="Aïn Témouchent">Aïn Témouchent</option>
                            <option value="Ghardaïa">Ghardaïa</option>
                            <option value="Relizane">Relizane</option>
                            <option value="Timimoun">Timimoun</option>
                            <option value="Bordj Badji Mokhtar">Bordj Badji Mokhtar</option>
                            <option value="Ouled Djellal">Ouled Djellal</option>
                            <option value="Béni Abbès">Béni Abbès</option>
                            <option value="In Salah">In Salah</option>
                            <option value="In Guezzam">In Guezzam</option>
                            <option value="Touggourt">Touggourt</option>
                            <option value="Djanet">Djanet</option>
                            <option value="El M'Ghair">El M'Ghair</option>
                            <option value="El Meniaa">El Meniaa</option>
                            <option value="Alger">Alger</option> {/* Ajouté pour la cohérence */}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="departureDate">Date de départ</label>
                        <input
                            type="text"
                            id="departureDate"
                            placeholder="jj/mm/aaaa"
                            value={departureDate}
                            onChange={(e) => setDepartureDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group row">
                        <div>
                            <label htmlFor="numVehicles">Nombre de véhicules</label>
                            <input
                                type="number"
                                id="numVehicles"
                                value={numVehicles}
                                onChange={(e) => setNumVehicles(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="numDrivers">Nombre de chauffeurs</label>
                            <input
                                type="number"
                                id="numDrivers"
                                value={numDrivers}
                                onChange={(e) => setNumDrivers(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="clients-section">
                    <h4>Clients</h4>
                    <div className="client-count">
                        <label htmlFor="numClients">Nombre de clients:</label>
                        <select
                            id="numClients"
                            value={numClients}
                            onChange={handleNumClientsChange}
                        >
                            {[...Array(10)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                    </div>
                    {clients.map((client, index) => (
                        <div key={index} className="client-details">
                            <h5>Client {index + 1}</h5>
                            <div className="form-group">
                                <label htmlFor={`clientName-${index}`}>Nom du client</label>
                                <input
                                    type="text"
                                    id={`clientName-${index}`}
                                    value={client.name}
                                    onChange={(e) => handleClientChange(index, 'name', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor={`clientWilaya-${index}`}>Wilaya</label>
                                <select
                                    id={`clientWilaya-${index}`}
                                    value={client.wilaya}
                                    onChange={(e) => handleClientChange(index, 'wilaya', e.target.value)}
                                >
                                    <option value="">Sélectionner une wilaya</option>
                                    <option value="Adrar">Adrar</option>
                                    <option value="Chlef">Chlef</option>
                                    <option value="Laghouat">Laghouat</option>
                                    <option value="Oum El Bouaghi">Oum El Bouaghi</option>
                                    <option value="Batna">Batna</option>
                                    <option value="Béjaïa">Béjaïa</option>
                                    <option value="Biskra">Biskra</option>
                                    <option value="Béchar">Béchar</option>
                                    <option value="Blida">Blida</option>
                                    <option value="Bouira">Bouira</option>
                                    <option value="Tlemcen">Tlemcen</option>
                                    <option value="Tébessa">Tébessa</option>
                                    <option value="Mostaganem">Mostaganem</option>
                                    <option value="Sétif">Sétif</option>
                                    <option value="Saïda">Saïda</option>
                                    <option value="Skikda">Skikda</option>
                                    <option value="Sidi Bel Abbès">Sidi Bel Abbès</option>
                                    <option value="Annaba">Annaba</option>
                                    <option value="Guelma">Guelma</option>
                                    <option value="Constantine">Constantine</option>
                                    <option value="Médéa">Médéa</option>
                                    <option value="Mascara">Mascara</option>
                                    <option value="Ouargla">Ouargla</option>
                                    <option value="El Bayadh">El Bayadh</option>
                                    <option value="Illizi">Illizi</option>
                                    <option value="Bordj Bou Arréridj">Bordj Bou Arréridj</option>
                                    <option value="Boumerdès">Boumerdès</option>
                                    <option value="El Tarf">El Tarf</option>
                                    <option value="Tindouf">Tindouf</option>
                                    <option value="Tissemsilt">Tissemsilt</option>
                                    <option value="El Oued">El Oued</option>
                                    <option value="Khenchela">Khenchela</option>
                                    <option value="Souk Ahras">Souk Ahras</option>
                                    <option value="Tipaza">Tipaza</option>
                                    <option value="Mila">Mila</option>
                                    <option value="Aïn Defla">Aïn Defla</option>
                                    <option value="Naâma">Naâma</option>
                                    <option value="Aïn Témouchent">Aïn Témouchent</option>
                                    <option value="Ghardaïa">Ghardaïa</option>
                                    <option value="Relizane">Relizane</option>
                                    <option value="Timimoun">Timimoun</option>
                                    <option value="Bordj Badji Mokhtar">Bordj Badji Mokhtar</option>
                                    <option value="Ouled Djellal">Ouled Djellal</option>
                                    <option value="Béni Abbès">Béni Abbès</option>
                                    <option value="In Salah">In Salah</option>
                                    <option value="In Guezzam">In Guezzam</option>
                                    <option value="Touggourt">Touggourt</option>
                                    <option value="Djanet">Djanet</option>
                                    <option value="El M'Ghair">El M'Ghair</option>
                                    <option value="El Meniaa">El Meniaa</option>
                                    <option value="Alger">Alger</option> {/* Ajouté pour la cohérence */}
                                </select>
                            </div>
                            <div className="products-section">
                    <h4>Produits</h4>
                    {products.map((product, index) => (
                        <div key={index} className="product-details">
                            <div className="form-group row">
                                <div>
                                    <label htmlFor={`productType-${index}`}>Type de produit</label>
                                    <input
                                        type="text"
                                        id={`productType-${index}`}
                                        value={product.type}
                                        onChange={(e) => handleProductChange(index, 'type', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`productQuantity-${index}`}>Quantité</label>
                                    <input
                                        type="number"
                                        id={`productQuantity-${index}`}
                                        value={product.quantity}
                                        onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" className="add-product-button" onClick={handleAddProduct}>
                        <span className="plus-icon">+</span> Ajouter Produit
                    </button>
                </div>
                        </div>
                    ))}
                </div>

                

                <button type="button" className="submit-button" onClick={handleSubmit}>
                    <span className="location-icon"></span> Enregistrer la livraison
                </button>
            </div>
        </div>
    );
};

export default DeliveryForm;