import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/error.css';

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