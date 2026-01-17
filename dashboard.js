
async function loadDashboard() {
    try {
        // Utilisateurs
        const usersRes = await axios.get('https://dummyjson.com/users?limit=50');
        const users = usersRes.data.users;

        // Produits
        const productsRes = await axios.get('https://dummyjson.com/products?limit=30');
        const products = productsRes.data.products;

        // Commandes (carts)
        const ordersRes = await axios.get('https://dummyjson.com/carts?limit=30');
        const orders = ordersRes.data.carts;

       //stats
        const totalUsers = users.length;
        const totalProducts = products.length;
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.total < 1000).length; // exemple simple
        const totalRevenue = orders.reduce((acc,o) => acc + o.total, 0);

        document.getElementById("total-users").textContent = totalUsers;
        document.getElementById("total-products").textContent = totalProducts;
        document.getElementById("total-orders").textContent = totalOrders;
        document.getElementById("pending-orders").textContent = pendingOrders;
        document.getElementById("total-revenue").textContent = totalRevenue + " MAD";

       //graphs

        // PieChart – Commandes livrées vs en attente
        new Chart(document.getElementById('pieChart'), {
            type:'pie',
            data:{
                labels:['Livré','En attente'],
                datasets:[{
                    data:[totalOrders - pendingOrders,pendingOrders],
                    backgroundColor:['#9fb8ad','#d49ca0']
                }]
            },
            options:{ responsive:true, plugins:{title:{display:true,text:'Commandes'}} }
        });

        // BarChart – Stock produits
        new Chart(document.getElementById('barChart'), {
            type:'bar',
            data:{
                labels: products.map(p=>p.title),
                datasets:[{label:'Stock',data:products.map(p=>p.stock), backgroundColor:'#3e4a44'}]
            },
            options:{ responsive:true, plugins:{title:{display:true,text:'Stock des produits'}}, scales:{x:{ticks:{display:false}}} }
        });

        // LineChart – Revenus par commande
        new Chart(document.getElementById('lineChart'), {
            type:'line',
            data:{
                labels: orders.map(o=>`Commande ${o.id}`),
                datasets:[{label:'Revenus', data:orders.map(o=>o.total), borderColor:'#9fb8ad', fill:false}]
            },
            options:{ responsive:true, plugins:{title:{display:true,text:'Revenus par commande'}}, scales:{x:{ticks:{display:false}}} }
        });

        // DoughnutChart – Répartition commandes
        new Chart(document.getElementById('doughnutChart'), {
            type:'doughnut',
            data:{
                labels:['Livré','En attente'],
                datasets:[{data:[totalOrders - pendingOrders,pendingOrders], backgroundColor:['#3e4a44','#d49ca0'] }]
            },
            options:{ responsive:true, plugins:{title:{display:true,text:'Répartition commandes'}} }
        });

        // ScatterChart – Revenus par commande
        new Chart(document.getElementById('scatterChart'), {
            type:'scatter',
            data:{
                datasets:[{
                    label:'Revenus',
                    data:orders.map(o=>({x:o.id,y:o.total})),
                    backgroundColor:'#d49ca0'
                }]
            },
            options:{ responsive:true, plugins:{title:{display:true,text:'Revenus par commande'}} }
        });

    } catch(err){
        console.error('Erreur chargement dashboard:', err);
    }
}
window.addEventListener('DOMContentLoaded', loadDashboard);
