import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import Preference from '../../components/client/Preference';

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