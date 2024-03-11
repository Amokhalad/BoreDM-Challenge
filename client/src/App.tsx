// src/App.tsx
import DataGridComponent from './components/DataGridComponent';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.module.css';

const App = () => {
  const wsUrl = 'ws://127.0.0.1:8000/ws'; // WebSocket server URL

  return (
    <div className="container-fluid">
      <h1 className="text-center">Datagrids and Websockets</h1>
      <h3 className="text-center">BoreDM Coding Challenge</h3>
      <div className="row justify-content-center my-5">
        <div className="col-md-6">
          <div className="datagrid-container">
            <DataGridComponent wsUrl={wsUrl} />
          </div>
        </div>
        <div className="col-md-6">
          <div className="datagrid-container">
            <DataGridComponent wsUrl={wsUrl} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
