let cliente = {
    mesa: '',
    hora: '',
    pedido: []
};

const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

const btnGuardarCLiente = document.querySelector('#guardar-cliente');
btnGuardarCLiente.addEventListener('click', guardarCliente)


function guardarCliente() {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    // Revisar si hay campos vacios
    const camposVacios = [ mesa, hora ].some( campo => campo === '');

    if(camposVacios) {
        // Verificar si ya hay una alerta
        const existeAlerta = document.querySelector('.invalid-feedback');

        if(!existeAlerta) {
            const alerta = document.createElement('div');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);

            setTimeout(() => {
                alerta.remove();
            }, 3000);
        }
        
        return;

    } 

    // Asignar datos del formulario a cliente
    cliente = { ...cliente, mesa, hora }

    // Ocultar modal
    const modalFormulario = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();


    // Mostrar las secciones
    mostrarSecciones();

    // Obtener platillos de la API de JSON-Server
    obtenerPlatillos();
}


function mostrarSecciones() {
    const seccionesOcultas = document.querySelectorAll('.d-none');
    seccionesOcultas.forEach(seccion => seccion.classList.remove('d-none'));


}


function obtenerPlatillos() {
    const url = 'http://localhost:4000/platillos';

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado => mostrarPlatillos(resultado))
        .catch(error => console.log(error))
}

function mostrarPlatillos(platillos) {
    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach(platillo => {
        const row = document.createElement('div');
        row.classList.add('row', 'py-3', 'border-top');

        const nombre = document.createElement('div');
        nombre.classList.add('col-md-4');
        nombre.textContent = platillo.nombre;

        const precio = document.createElement('div');
        precio.classList.add('col-md-3', 'fw-bold');
        precio.textContent = `${platillo.precio}€`;

        const categoria = document.createElement('div')
        categoria.classList.add('col-md-3');
        categoria.textContent = categorias[ platillo.categoria ];

        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.classList.add('form-control');

        // Funcion que detecta la cantidad y el plato que se está agregando
        inputCantidad.onchange = function() {
            const cantidad = parseInt( inputCantidad.value );
            agregarPlatillo({...platillo, cantidad});
        };

        const agregar = document.createElement('div')
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad);

        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);

        contenido.appendChild(row);
    })
}


function agregarPlatillo(producto) {
    // Extraer pedido actual
    let { pedido } = cliente;

    // Revisar que la cantidad sea mayor a 0
    if(producto.cantidad > 0) {
        // Comprobar si el elemento ya extiste en el array
        if(pedido.some( articulo => articulo.id === producto.id)) {
            // El articulo ya existe, actualizamos la cantidad
            const pedidoActualizado = pedido.map( articulo => {
                if( articulo.id === producto.id ) {
                    articulo.cantidad = producto.cantidad;
                }
                return articulo;
            });
            // Se asigna el nuevo array
            cliente.pedido = [...pedidoActualizado];
        } else {
            // El articulo no existe, entonces lo agregamos al array de pedidos
            cliente.pedido = [...pedido, producto];
        }


    } else {
        // Eliminar elementos cuando la cantidad es 0
        const resultado = pedido.filter( articulo => articulo.id !== producto.id)

        cliente.pedido = [...resultado];
    }

    // Limpiar el HTML Previo
    limpiarHTML();

    if(cliente.pedido.length) {
        // Mostrar el resumen
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }


}

// ! json-server --watch db.json --port 4000 en la terminal


function actualizarResumen() {
    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('div');
    resumen.classList.add('col-md-6', 'card', 'py-5', 'px-3', 'shadow');

    // Información de la mesa
    const mesa = document.createElement('p');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('span');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    // Información de la hora
    const hora = document.createElement('p');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('span');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    // Agregar a los elementos padre
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    //Titulo de la seccion
    const heading = document.createElement('h3');
    heading.textContent = 'Platos Consumidos';
    heading.classList.add('my-4', 'text-center');    

    // Iterar sobre el array de pedidos:
    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    const { pedido } = cliente;
    pedido.forEach( articulo => {
        const { nombre, cantidad, precio, id } = articulo;

        const lista = document.createElement('li');
        lista.classList.add('list-group-item');

        // Nombre del articulo
        const nombreEl = document.createElement('h4');
        nombreEl.classList.add('my-4');
        nombreEl.textContent = nombre;

        // Cantidad del articulo
        const cantidadEl = document.createElement('p');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('span');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        // Precio del articulo
        const precioEl = document.createElement('p');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: ';

        const precioValor = document.createElement('span');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `${precio} €`;


        // Subtotal del articulo
        const subtotalEl = document.createElement('p');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';

        const subtotalValor = document.createElement('span');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal(precio, cantidad);

        // Boton para eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar del pedido';
        btnEliminar.onclick = function() {
            eliminarProducto(id);
        }



        // Agregar valores a sus contenedores
        cantidadEl.appendChild(cantidadValor);
        precioEl.appendChild(precioValor);
        subtotalEl.appendChild(subtotalValor);


        // Agregar elementos al LI
        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);

        // Agregar lista al grupo principal
        grupo.appendChild(lista);

    })

    // Agregar al contenido
    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);

    contenido.appendChild(resumen);

    // Mostrar formulario de propinas
    formularioPropinas();
}


function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido');

    while( contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    }
}

function calcularSubtotal(precio, cantidad) {
    return parseInt(`${precio * cantidad} €`);
}

function eliminarProducto(id) {
    const { pedido } = cliente;
    const resultado = pedido.filter( articulo => articulo.id !== id)
    cliente.pedido = [...resultado];

    limpiarHTML();
    
    if(cliente.pedido.length) {
        actualizarResumen();    
    } else {
        mensajePedidoVacio();
    }

    // El producto se eliminó por lo tanto regresamos la cantidad a 0 en el formulario
    const productoEliminado = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;

}


function mensajePedidoVacio() {
    const contenido = document.querySelector('#resumen .contenido')

    const texto = document.createElement('p')
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos del pedido'

    contenido.appendChild(texto);
}


function formularioPropinas() {
    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('div');
    formulario.classList.add('col-md-6', 'formulario');

    const divFormulario = document.createElement('div')
    divFormulario.classList.add('card', 'py-2', 'px-3', 'shadow');
    
    const heading = document.createElement('h3');
    heading.classList.add('my-4', 'text-center')
    heading.textContent = 'Propina';

    // Radio button 1.5%
    const radio1 = document.createElement('input');
    radio1.type = 'radio';
    radio1.name = 'propina';
    radio1.value = "5";
    radio1.classList.add('form-check-input');
    radio1.onclick = calcularPropina;

    const radio1Label = document.createElement('label');
    radio1Label.textContent = '5%';
    radio1Label.classList.add('form-check-label')

    const radio1Div = document.createElement('div')
    radio1Div.classList.add('form-check');

    radio1Div.appendChild(radio1);
    radio1Div.appendChild(radio1Label)


    // Radio button 3.5%
    const radio2 = document.createElement('input');
    radio2.type = 'radio';
    radio2.name = 'propina';
    radio2.value = "10";
    radio2.classList.add('form-check-input');
    radio2.onclick = calcularPropina;

    const radio2Label = document.createElement('label');
    radio2Label.textContent = '10%';
    radio2Label.classList.add('form-check-label')

    const radio2Div = document.createElement('div')
    radio2Div.classList.add('form-check');

    radio2Div.appendChild(radio2);
    radio2Div.appendChild(radio2Label)

    // Radio button 5%
    const radio3 = document.createElement('input');
    radio3.type = 'radio';
    radio3.name = 'propina';
    radio3.value = "15";
    radio3.classList.add('form-check-input');
    radio3.onclick = calcularPropina;

    const radio3Label = document.createElement('label');
    radio3Label.textContent = '15%';
    radio3Label.classList.add('form-check-label')

    const radio3Div = document.createElement('div')
    radio3Div.classList.add('form-check');

    radio3Div.appendChild(radio3);
    radio3Div.appendChild(radio3Label)
    
    // Agregar al div Principal
    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio1Div);
    divFormulario.appendChild(radio2Div);
    divFormulario.appendChild(radio3Div);
    


    // Agregar al formulario
    formulario.appendChild(divFormulario);



    contenido.appendChild(formulario);

}



function calcularPropina() {
    
    const { pedido } = cliente
    let subtotal = 0;

    // Calcular el subtotal a pagar
    pedido.forEach( articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    });

    // Seleccionar el radiobutton con la propina del cliente

    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

    // Calcular la propina
    const propina = ((subtotal * parseInt( propinaSeleccionada )) / 100);


    // Calcular el total
    const total = subtotal + propina;

    mostrarTotalHTML(subtotal, total, propina);
}

function mostrarTotalHTML(subtotal, total, propina) {

    const divTotales = document.createElement('div')
    divTotales.classList.add('total-pagar', 'my-5')

    // Subtotal
    const subtotalParrafo = document.createElement('p')
    subtotalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    subtotalParrafo.textContent = 'Subtotal Consumo: '

    const subtotalSpan = document.createElement('span')
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `${subtotal} €`;

    subtotalParrafo.appendChild(subtotalSpan)

    // Propina
    const propinaParrafo = document.createElement('p')
    propinaParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    propinaParrafo.textContent = 'Propina: '

    const propinaSpan = document.createElement('span')
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `${propina} €`;

    propinaParrafo.appendChild(propinaSpan);

    // Total
    const totalParrafo = document.createElement('p')
    totalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    totalParrafo.textContent = 'Total: '

    const totalSpan = document.createElement('span')
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `${total} €`;

    totalParrafo.appendChild(totalSpan);    

    // Eliminar ultimos resultados
    const totalpagarDiv = document.querySelector('.total-pagar');
    if(totalpagarDiv) {
        totalpagarDiv.remove()
    }

    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    const formulario = document.querySelector('.formulario > div');

    formulario.appendChild(divTotales);
}