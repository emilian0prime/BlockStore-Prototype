const contractSource = '
contract Blockstore =

  record purchase =
    { creatorAddress : address,
      amount      : int }

  record state =
    { purchases      : map(int, purchase),
      purchasesLength : int }

  entrypoint init() =
    { purchases = {},
      purchasesLength = 0 }

  entrypoint getPay(index : int) : purchase =
  	switch(Map.lookup(index, state.purchases))
	    None    => abort("There was no purchases with this index registered.")
	    Some(x) => x

  stateful entrypoint registerPurchase(url' : string, name' : string) =
    let purchase = { creatorAddress = Call.caller, url = url', name = name', amount = 0}
    let index = getPurchasesLength() + 1
    put(state{ purchases[index] = purchase, purchasesLength = index })

  entrypoint getPurchasesLength() : int =
    state.purchasesLength

  stateful entrypoint buyProduct(index : int) =
    let purchase = getPay(index)
    Chain.spend(purchase.creatorAddress, Call.value)
    let updatedamount = purchase.amount + Call.value
    let updatedPurchases = state.purchases{ [index].amount = updatedamount }
    put(state{ purchases = updatedPurchases })';


const contractAddress ='ct_2rAoyeGTzhzJ1dX3wEAKi46L6frH6E7pucrUMRCK9mk5a4yb4v';
var client = null
var paymentArray = [];
var purchasesLength = 0

function renderPayment() {
    var template = $('#template').html();
    Mustache.parse(template);
    var rendered = Mustache.render(template, {});
    $('#paymentBody').html(rendered);
}

async function callStatic(func, args) {
const contract = await client.getContractInstance(contractSource, {contractAddress});
const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
const decodedGet = await calledGet.decode().catch(e => console.error(e));

return decodedGet;
}

async function callStatic(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  const calledSet = await contract.call(func, args, {amount: value}).catch(e => console.error(e));
  
  return calledSet;
}


window.addEventListener('load', async () => {
    $("#loader").show();

    client = await Ae.Aepp();

    purchasesLength = await callStatic('getPurchasesLength', [])

    for (let i = 1; i <= purchasesLength; i++){
     const purchase = await callStatic('getPurchase', [i])



     paymentArray.push({
    index: i,
    purchases: purchase.amount

    $("#loader").hide();
  })
}

    renderPayment();
});

jQuery("#paymentBody").on("click", ".payBtn", async function(event){
    $("#loader").show();

    const value = $(this).siblings('input').val();
    const dataIndex = event.target.id;

    await contractCall('pay', [dataIndex], value);

    const foundIndex = paymentArray.findIndex(purchase => purchase.index == dataIndex);
    paymentArray[foundIndex].payments += parseInt(value, 10);
    renderPayments();
  });
   $("#loader").hide();

  paymentArray.push({
    index: i,
    purchases: purchase.amount
 })
}
