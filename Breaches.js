import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Breaches() {
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBreach, setNewBreach] = useState({
    type: 'Утечка email-адресов',
    severity: 'Средняя',
    description: '',
    affected_users: 0
  });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBreaches();
  }, []);

  const fetchBreaches = async () => {
    try {
      setLoading(true);
      const response = await api.getDataBreaches();
      setBreaches(response.data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить утечки');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту утечку?')) return;
    
    try {
      await api.deleteDataBreach(id);
      setBreaches(breaches.filter(breach => breach.id !== id));
      setError(null);
    } catch (err) {
      setError('Не удалось удалить утечку');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.reportDataBreach({
        ...newBreach,
        date_detected: new Date().toISOString().split('T')[0],
        status: 'Расследуется'
      });
      
      setBreaches([...breaches, response.data]);
      setNewBreach({
        type: 'Утечка email-адресов',
        severity: 'Средняя',
        description: '',
        affected_users: 0
      });
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError('Не удалось добавить утечку');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBreach(prev => ({ 
      ...prev, 
      [name]: name === 'affected_users' ? parseInt(value) || 0 : value 
    }));
  };

  return (
    <div className="container">
      <h2>Управление утечками данных</h2>
      <Link to="/" className="btn link">На главную</Link>

      {error && <div className="error">{error}</div>}

      <button 
        onClick={() => setShowForm(!showForm)} 
        className="btn primary"
      >
        {showForm ? 'Скрыть форму' : 'Сообщить об утечке'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <h3>Новая утечка данных</h3>
          
          <div className="form-group">
            <label>Тип утечки:</label>
            <select
              name="type"
              value={newBreach.type}
              onChange={handleInputChange}
              required
            >
              <option value="Утечка email-адресов">Утечка email-адресов</option>
              <option value="Утечка паролей">Утечка паролей</option>
              <option value="Утечка платежных данных">Утечка платежных данных</option>
              <option value="Утечка персональных данных">Утечка персональных данных</option>
            </select>
          </div>

          <div className="form-group">
            <label>Уровень серьезности:</label>
            <select
              name="severity"
              value={newBreach.severity}
              onChange={handleInputChange}
              required
            >
              <option value="Низкая">Низкая</option>
              <option value="Средняя">Средняя</option>
              <option value="Высокая">Высокая</option>
              <option value="Критическая">Критическая</option>
            </select>
          </div>

          <div className="form-group">
            <label>Количество пострадавших:</label>
            <input
              type="number"
              name="affected_users"
              value={newBreach.affected_users}
              onChange={handleInputChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Описание:</label>
            <textarea
              name="description"
              value={newBreach.description}
              onChange={handleInputChange}
              required
              rows="4"
            />
          </div>

          <button type="submit" className="btn success">Зарегистрировать утечку</button>
        </form>
      )}

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : breaches.length === 0 ? (
        <div className="empty">Нет зарегистрированных утечек</div>
      ) : (
        <div className="breaches-grid">
          {breaches.map(breach => (
            <div key={breach.id} className="breach-card">
              <h3>{breach.type}</h3>
              <p><strong>Уровень:</strong> <span className={`severity-${breach.severity.toLowerCase()}`}>{breach.severity}</span></p>
              <p><strong>Пострадало:</strong> {breach.affected_users} чел.</p>
              <p><strong>Дата:</strong> {breach.date_detected}</p>
              <p><strong>Статус:</strong> {breach.status}</p>
              <div className="actions">
                <button 
                  onClick={() => handleDelete(breach.id)} 
                  className="btn danger"
                >
                  Удалить
                </button>
                <Link to={`/breaches/${breach.id}`} className="btn">
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
