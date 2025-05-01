// src/Login.js
import React, { useState } from 'react';
import './Auth.css';

const Login = ({ onLoginSuccess }) => {
    const [isSignup, setIsSignup] = useState(false); // Initialement sur la page de connexion
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // Nouveau champ pour l'inscription

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSignup) {
            console.log('Signup:', { username, email, password });
            //  **Appel AJAX à votre serveur pour enregistrer l'utilisateur**
            try {
                const response = await fetch('/api/users/signup', {  // Assurez-vous que votre serveur est sur le même domaine ou configurez CORS
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password }),
                });

                const data = await response.json();  // Parse la réponse JSON

                if (response.ok) {
                    console.log('Inscription réussie!', data);
                    //  **Gérer l'inscription réussie (par exemple, afficher un message de succès, rediriger)**
                    alert('Inscription réussie! Vous pouvez maintenant vous connecter.');
                    setIsSignup(false); // Optionnel : revenir au formulaire de connexion
                } else {
                    console.error('Échec de l\'inscription:', data);
                    //  **Gérer les erreurs d'inscription (par exemple, afficher un message d'erreur à l'utilisateur)**
                    alert(`Échec de l'inscription: ${data.message || 'Une erreur s\'est produite'}`);
                }
            } catch (error) {
                console.error('Erreur d\'inscription:', error);
                alert('Erreur d\'inscription: Impossible de se connecter au serveur.');
            }

        } else {
            console.log('Login:', { email, password });
            try {
                const response = await fetch('/api/users/login', {  // Appel à la nouvelle route de connexion
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Connexion réussie!', data);
                    // **Ici, vous géreriez la connexion réussie (par exemple, stocker le token, rediriger l'utilisateur)**
                    onLoginSuccess(); //  Ceci est un placeholder.  Remplacez par votre logique réelle.
                } else {
                    console.error('Échec de la connexion:', data);
                    alert(`Échec de la connexion: ${data.message || 'Email ou mot de passe incorrect'}`);
                }
            } catch (error) {
                console.error('Erreur de connexion:', error);
                alert('Erreur de connexion: Impossible de se connecter au serveur.');
            }
        }
    };


    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-tabs">
                    <button
                        className={!isSignup ? 'active' : ''}
                        onClick={() => setIsSignup(false)}
                    >
                        Se connecter
                    </button>
                    <button
                        className={isSignup ? 'active' : ''}
                        onClick={() => setIsSignup(true)}
                    >
                        S'inscrire
                    </button>
                </div>

                <div className="auth-form-container">
                    <h2>{isSignup ? 'Créer un compte' : 'Se connecter'}</h2>
                    <p className="auth-subtitle">
                        {isSignup
                            ? 'Créez votre compte pour accéder au système de livraison'
                            : 'Connectez-vous à votre compte'}
                    </p>
                    <form onSubmit={handleSubmit}>
                        {isSignup && (
                            <div className="form-group">
                                <label htmlFor="username">username</label>
                                <input
                                    type="text"
                                    id="username"
                                    placeholder="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Mot de passe</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-button">
                            {isSignup ? 'S\'inscrire' : 'Se connecter'}
                        </button>
                    </form>
                </div>
            </div>

            
        </div>
    );
};

export default Login;