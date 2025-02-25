const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = './todo.proto';
const fs = require('fs');


const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

const clientCert = fs.readFileSync('certs/server.crt');

const credentials = grpc.credentials.createSsl( 
  clientCert  
);

const client = new todoProto.TodoService('localhost:50051', credentials);

// Fonction pour récupérer un produit par ID
const getProduct = (productId) => {
  client.getProduct({ id: productId }, (err, response) => {
    if (err) {
      console.error('Error:', err.details);  
    } else {
      console.log('Product:', response.product);
    }
  });
};

// Exemple d'appel à getProduct
getProduct('1');  // Remplacer par un ID valide ou invalide
 