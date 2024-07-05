// src/pages/Home.js

import React from 'react';
import chung from '../assets/chungus.png'

function Home() {
    return (
        <div>
            <img src={chung} alt="chung.png" style={{display: "flex", width: "100%", justifyContent: "center"}}/>
        </div>
    );
}

export default Home;
