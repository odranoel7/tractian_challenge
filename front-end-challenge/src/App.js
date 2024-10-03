import React, { useState } from 'react';
import AssetTree from './components/AssetTree';
import './App.css';
import iconBtnCompany from './assets/icons/btnUnit.png';
import tractianIcon from './assets/icons/tractianIcon.png';


function App() {
  const [companyId, setCompanyId] = useState('');
  const [selectedButton, setSelectedButton] = useState(null);

  const handleButtonClick = (id, buttonIndex) => {
    setCompanyId(id);
    setSelectedButton(buttonIndex);
  };

  return (
    <div className="App">
      {/* Topo fixo */}
      <header className="main-header">
        <img
          src={tractianIcon}
          alt="Tractian"
          style={{
            width: '102.95px',
            height: '14px',
            marginLeft: '5px',
          }}
        />

        <div className="button-group">
          <button
            className={`top-button ${selectedButton === 1 ? 'selected' : ''}`}
            onClick={() => handleButtonClick('662fd0ee639069143a8fc387', 1)}
          >
            <img
              src={iconBtnCompany}
              alt="Jaguar Unit Icon"
              style={{
                width: '17px',
                height: '17px',
                marginRight: '5px',
                marginLeft: '5px',
              }}
            /> Jaguar Unit
          </button>
          <button
            className={`top-button ${selectedButton === 2 ? 'selected' : ''}`}
            onClick={() => handleButtonClick('662fd0fab3fd5656edb39af5', 2)}
          >
            <img
              src={iconBtnCompany}
              alt="Jaguar Unit Icon"
              style={{
                width: '17px',
                height: '17px',
                marginRight: '5px',
                marginLeft: '5px',
              }}
            /> Tobias Unit
          </button>
          <button
            className={`top-button ${selectedButton === 3 ? 'selected' : ''}`}
            onClick={() => handleButtonClick('662fd100f990557384756e58', 3)}
          >
            <img
              src={iconBtnCompany}
              alt="Jaguar Unit Icon"
              style={{
                width: '17px',
                height: '17px',
                marginRight: '5px',
                marginLeft: '5px',
              }}
            /> Apex Unit
          </button>
        </div>
      </header>

      
      <div className="content-block">
        {companyId ? (
          <AssetTree companyId={companyId} />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Selecione uma empresa para carregar os dados.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

