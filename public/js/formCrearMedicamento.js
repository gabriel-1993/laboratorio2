document.addEventListener('DOMContentLoaded', function () {



    const nombre_generico_input = document.getElementById('nombre_generico');
    const nombre_comercial_input = document.getElementById('nombre_comercial');
    const id_familia_input = document.getElementById('id_familia');
    const id_categoria_input = document.getElementById('id_categoria');

    const btnAgregar = document.querySelector('.btnAgregarMedicamento');

    async function crearMedicamento() {

        
        console.log("11 : " + nombre_generico_input.value);

        // const medicamento = {
        //     nombre_generico,
        //     nombre_comercial,
        //     id_familia,
        //     id_categoria
        // };

        // try {
        //     const response = await fetch('/api/medicamento', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify(medicamento)
        //     });

        //     if (response.ok) {
        //         const result = await response.json();
        //         console.log('Medicamento creado:', result);
        //     } else {
        //         console.error('Error al crear medicamento:', response.statusText);
        //     }
        // } catch (error) {
        //     console.error('Error al crear medicamento:', error);
        // }
    }


btnAgregar.addEventListener('click', crearMedicamento);


});
