import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRequest, setNewRequest] = useState({
    request_type: 'Доступ к данным',
    user_name: '',
    email: '',
    description: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.getPrivacyRequests();
      setRequests(response.data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить запросы');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот запрос?')) return;
    
    try {
      await api.deletePrivacyRequest(id);
      setRequests(requests.filter(req => req.id !== id));
      setError(null);
    } catch (err) {
      setError('Не удалось удалить запрос');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.createPrivacyRequest({
        ...newRequest,
        status: 'В обработке',
        date: new Date().toISOString().split('T')[0]
      });
      
      setRequests([...requests, response.data]);
      setNewRequest({
        request_type: 'Доступ к данным',
        user_name: '',
        email: '',
        description: ''
      });
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError('Не удалось создать запрос');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRequest(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container">
      <h2>Управление запросами на данные</h2>
      <Link to="/" className="btn link">На главную</Link>

      {error && <div className="error">{error}</div>}

      <button 
        onClick={() => setShowForm(!showForm)} 
        className="btn primary"
      >
        {showForm ? 'Скрыть форму' : 'Создать новый запрос'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <h3>Новый запрос на данные</h3>
          
          <div className="form-group">
            <label>Тип запроса:</label>
            <select
              name="request_type"
              value={newRequest.request_type}
              onChange={handleInputChange}
              required
            >
              <option value="Доступ к данным">Доступ к данным</option>
              <option value="Удаление данных">Удаление данных</option>
              <option value="Исправление данных">Исправление данных</option>
            </select>
          </div>

          <div className="form-group">
            <label>Имя пользователя:</label>
            <input
              type="text"
              name="user_name"
              value={newRequest.user_name}
              onChange={handleInputChange}
              required
              minLength="2"
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={newRequest.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Описание:</label>
            <textarea
              name="description"
              value={newRequest.description}
              onChange={handleInputChange}
              required
              rows="4"
            />
          </div>

          <button type="submit" className="btn success">Отправить запрос</button>
        </form>
      )}

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : requests.length === 0 ? (
        <div className="empty">Нет созданных запросов</div>
      ) : (
        <div className="requests-list">
          {requests.map(request => (
            <div key={request.id} className="request-card">
              <h3>{request.user_name}</h3>
              <p><strong>Тип:</strong> {request.request_type}</p>
              <p><strong>Статус:</strong> {request.status}</p>
              <p><strong>Дата:</strong> {request.date}</p>
              <div className="actions">
                <button 
                  onClick={() => handleDelete(request.id)} 
                  className="btn danger"
                >
                  Удалить
                </button>
                <Link to={`/requests/${request.id}`} className="btn">
                  Подробнее
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
