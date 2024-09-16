import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { IUsers } from './interfaces/user.interface';


const App: React.FC = () => {
    const [email, setEmail] = useState('');
    const [number, setNumber] = useState('');
    const [searchResult, setSearchResult] = useState<IUsers[]>([]);
    const [loading, setLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [isRequestSend, setIsRequestSend] = useState(false);
    const [cancelMessage, setCancelMessage] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = async () => {
        console.log()
        setIsRequestSend(true);
        setSearchResult([]);
        setNotFound(false);
        setLoading(true);
        setCancelMessage(false);

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;
        const urlPath = process.env.REACT_APP_BASE_URL + ''

        try {
            const response = await axios.post(
                urlPath,
                { email, number },
                { signal }
            );
            setSearchResult(response.data);
            if (response.data.length === 0) {
                setNotFound(true);
            }
            setIsRequestSend(false);
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request canceled:', (error as Error).message);
                setCancelMessage(true);
            } else if (error instanceof Error) {
                console.error('Error fetching data:', error.message);
            } else {
                console.error('Unknown error occurred', error);
            }
        } finally {
            setLoading(false);
            setIsRequestSend(false)
        }
    };

    const handleClick = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isRequestSend) {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            setIsRequestSend(false)
            return;
        }
        fetchData();
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.replace(/\D/g, ''); 
        const formatted = input.match(/.{1,2}/g)?.join('-') || ''; 
        setNumber(formatted);
    };

    return (
        <div className="container">
            <form onSubmit={handleClick}>
                <div>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label>Number:</label>
                    <input
                        type="text"
                        value={number}
                        onChange={handleNumberChange}
                        pattern="\d{2}-\d{2}-\d{2}"
                        placeholder="Format: xx-xx-xx"
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
            {loading && <p className="loading">Loading...</p>}
            {notFound && <p className="not-found">Not found</p>}
            {cancelMessage && <p className="cancel-message">Request was canceled</p>}
            {searchResult.length > 0 && (
                <ul>
                    {searchResult.map((user, index) => (
                        <li key={index}>
                            Email: {user.email}, Number: {user.number}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default App;
