import '../../styles/cart.css';

function Cart({cartItems, setCartItems}) {
    const item1 = 15;
    const item2 = 20;

    let total = 0;
    for (let item of cartItems) {
        total += item.price * item.quantity
    }

    return (
        <div className="cart">
            <h1>Cart</h1>
            {cartItems.map((item) => (
                <div className="cart-item">
                    <p>{item.name} : </p>
                    <p>{item.price}€</p>
                    <p>QTE : {item.quantity}</p>
                </div>
            ))}

            <div className="cart-total">
                <p><b>Total:</b>{total}€</p>
                <div className="area-button">
                    <button className="button" onClick={() => {setCartItems([])}}>Vider le panier</button>
                </div>
                
            </div>
        </div>
    );
}
export default Cart;