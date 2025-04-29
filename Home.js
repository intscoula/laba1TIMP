import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <h1>Центр защиты персональных данных</h1>
      <nav>
        <Link to="/requests">Запросы на данные</Link> | 
        <Link to="/breaches">Утечки данных</Link>
      </nav>
    </div>
  );
}
