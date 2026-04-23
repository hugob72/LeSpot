import Header from '../components/Header';
import Footer from '../components/Footer';
import Preference from '../components/Preference';

function Preferences() {
    return (
        <div className="home">
            <Header />
            <div className="my-container">
                <Preference />
            </div>
            <Footer />
        </div>
    );
}
export default Preferences;