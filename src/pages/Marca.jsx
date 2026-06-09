
import { useQuery } from "@tanstack/react-query";
import { useEmpresaStore } from "../store/EmpresaStore";
import { SpinnerLoader } from "../components/moleculas/SpinnerLoader";
import { MarcaTemplate } from "../components/templates/MarcaTemplate";
import { useMarcaStore } from "../store/MarcaStore";

export function Marca() {
  const {mostrarMarca,datamarca,buscarMarca} = useMarcaStore()
  const {buscador} = useMarcaStore();
  const {dataempresa} = useEmpresaStore()
  //mostrar data
 const {data,isLoading,error} = useQuery({queryKey:["mostrar marcas",dataempresa.id],queryFn:()=>mostrarMarca({id_empresa:dataempresa.id}),enabled:dataempresa.id!=null})
 //buscador
 const {data:buscar} = useQuery({queryKey:["buscar marcas",buscador],queryFn:()=>buscarMarca({descripcion: buscador,id_empresa:dataempresa.id}),enabled:dataempresa.id!=null && String(buscador ?? "").trim().length > 0})
 //respuestas
 if(isLoading){
  return <SpinnerLoader compact />
 }
 if(error){
  return <span>Error...</span>
 }
  return (<>

    <MarcaTemplate data={datamarca}/>
  </>)
}
