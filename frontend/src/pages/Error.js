import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/error.css';

function Error() {
    return (
        <div className="home">
            <Header />
            <div className="error-container">
                <h1>404</h1>
                <p>Page not found</p>
            </div>
            
            <Footer />
        </div>
    );
}
export default Error;