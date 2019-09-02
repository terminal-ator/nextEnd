const { prisma } = require('./generated/prisma-client');
const moment = require('moment');

const paginateResults = ({ after: cursor, pageSize = 20, results, getCursor = () => null }) => {
	if (pageSize < 1) return [];

	if (!cursor) return results.slice(0, pageSize);

	const cursorIndex = results.findIndex(item => {
		let itemCursor = item.cursor ? item.cursor : getCursor(item);

		return itemCursor ? cursor === itemCursor : false;
	});

	return cursorIndex >= 0
		? cursorIndex === results.length - 1
			? []
			: results.slice(cursorIndex + 1, Math.min(results.length, cursorIndex + 1 + pageSize))
		: results.slice(0, pageSize);
};

const createOrder = async (input, user) => {
	if (!user) return;
	const { itemID, address, paymentType, shippingCost } = input;
	// Get items from the cart and check if those belong to the user
	console.log('Item ID display:', itemID);
	const fragment = `
        fragment cartItemWithVariant on CartItem{
          id
          quantity
          variant{
            price
          }
        }
      `;
	const orderFragment = `
       fragment withItemsInOrder on Order{
         id
         orderDate
         delivered
         amount
         eta
         deliverDate
         items{
           id
           variant{
             id
           }
           quantity
         }
       }
      `;
	const items = await prisma.cartItems({ where: { id_in: itemID } }).$fragment(fragment);
	let amount = shippingCost;
	console.log(`Initial Amount: ${amount}`);
	console.log(items);
	amount = items.reduce((sum, item) => sum + item.quantity * item.variant.price, amount);
	console.log(`Final Amount: ${amount}`);
	const order = await prisma
		.createOrder({
			amount,
			deliverDate: '2019-02-04',
			delivered: false,
			items: {
				connect: items.map(item => ({
					id: item.id
				}))
			},
			deliverTo: {
				connect: {
					id: address
				}
			},
			payment: {
				create: {
					payed: paymentType == 'COD' ? false : true,
					modeOfPayment: paymentType,
					user: {
						connect: {
							id: user.id
						}
					},
					amount
				}
			},
			orderDate: moment().format(),
			user: {
				connect: {
					id: user.id
				}
			}
		})
		.$fragment(orderFragment);
	console.log('The order is: ', order);

	// remove the items from cart
	const cart = await prisma.user({ id: user.id }).cart();
	console.log({ itemID });

	await prisma.updateCart({
		data: {
			items: {
				disconnect: itemID.map(item => ({
					id: item
				}))
			}
		},
		where: {
			id: cart.id
		}
	});

	return prisma.order({ id: order.id });
};

module.exports = {
	paginateResults,
	createOrder
};
