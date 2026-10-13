import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import api from "@/services/api";

export default function NovoLote() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const loteId = params.id; // Se houver ID, estamos editando!

  const [nome, setNome] = useState("");
  const [dataChegada, setDataChegada] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [linhagem, setLinhagem] = useState("");
  const [finalidade, setFinalidade] = useState("");
  const [animalId, setAnimalId] = useState(""); // Novo estado para o ID do animal/tipo
  
  const [animaisList, setAnimaisList] = useState<any[]>([]); // Lista de animais disponíveis
  const [loading, setLoading] = useState(false);

  // Carrega a lista de animais e, se houver ID, os dados do lote
  useEffect(() => {
    carregarAnimais();
    if (loteId) {
      carregarDadosLote();
    }
  }, [loteId]);

  const carregarAnimais = async () => {
    try {
      // Ajuste a rota caso seu endpoint de animais seja diferente (ex: /animals)
      const response = await api.get("/animals");
      setAnimaisList(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar animais:", error);
      Alert.alert("Aviso", "Não foi possível carregar a lista de tipos de animais.");
    }
  };

  const carregarDadosLote = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/lotes/${loteId}`);
      const lote = response.data;

      setNome(lote.nome);
      setQuantidade(String(lote.quantidadeInicial));
      setLinhagem(lote.linhagem);
      setFinalidade(lote.finalidade);
      setAnimalId(String(lote.animalId || lote.animal?.id || ""));

      if (lote.dataChegada) {
        const dataPura = lote.dataChegada.split("T")[0];
        const [ano, mes, dia] = dataPura.split("-");
        setDataChegada(`${dia}/${mes}/${ano}`);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os dados do lote.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (text: string) => {
    let formattedText = text.replace(/\D/g, "");
    if (formattedText.length > 2)
      formattedText = formattedText.replace(/^(\d{2})(\d)/, "$1/$2");
    if (formattedText.length > 5)
      formattedText = formattedText.replace(
        /^(\d{2})\/(\d{2})(\d)/,
        "$1/$2/$3",
      );
    setDataChegada(formattedText.substring(0, 10));
  };

  const handleSalvar = async () => {
    if (!nome || !dataChegada || !quantidade || !linhagem || !finalidade || !animalId) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos e selecione o animal vinculado.");
      return;
    }

    try {
      setLoading(true);
      const [dia, mes, ano] = dataChegada.split("/");
      const dataIso = `${ano}-${mes}-${dia}T00:00:00Z`;

      const payload = {
        nome,
        dataChegada: dataIso,
        quantidadeInicial: Number(quantidade),
        quantidadeAtual: Number(quantidade),
        linhagem,
        finalidade,
        animalId: Number(animalId), // Vincula obrigatoriamente o ID do animal selecionado
        ativo: true,
      };

      if (loteId) {
        await api.put(`/lotes/${loteId}`, payload);
        Alert.alert("Sucesso", "Lote atualizado com sucesso!");
      } else {
        await api.post("/lotes", payload);
        Alert.alert("Sucesso", "Lote cadastrado com sucesso!");
      }

      router.replace("/");
    } catch (error) {
      console.error("Erro ao salvar lote:", error);
      Alert.alert("Erro", "Ocorreu um erro ao salvar os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Stack.Screen
        options={{
          title: loteId ? "Editar Lote" : "Novo Lote",
          headerStyle: { backgroundColor: "#121212" },
          headerTintColor: "#fff",
        }}
      />

      <View style={styles.form}>
        <Text style={styles.label}>Nome de Identificação</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Galpão A"
          placeholderTextColor="#666"
          value={nome}
          onChangeText={setNome}
        />

        {/* SELETOR OBRIGATÓRIO DE ANIMAL/TIPO */}
        <Text style={styles.label}>Vincular Animal / Tipo (Obrigatório)</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={animalId}
            onValueChange={(itemValue) => setAnimalId(itemValue)}
            style={styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Selecione o animal/tipo..." value="" color="#666" />
            {animaisList.map((animal) => (
              <Picker.Item
                key={animal.id}
                label={`${animal.name} (${animal.species || 'Geral'})`}
                value={String(animal.id)}
                color="#000"
              />
            ))}
          </Picker>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Data de Chegada</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={dataChegada}
              onChangeText={handleDateChange}
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1 }]}>
            <Text style={styles.label}>Qtd. Inicial</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 500"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={quantidade}
              onChangeText={setQuantidade}
            />
          </View>
        </View>

        <Text style={styles.label}>Linhagem das Aves</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Cobb"
          placeholderTextColor="#666"
          value={linhagem}
          onChangeText={setLinhagem}
        />

        <Text style={styles.label}>Finalidade</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Corte"
          placeholderTextColor="#666"
          value={finalidade}
          onChangeText={setFinalidade}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSalvar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {loteId ? "Salvar Alterações" : "Cadastrar Lote"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  form: { padding: 20 },
  label: { color: "#aaa", fontSize: 14, marginBottom: 8, fontWeight: "bold" },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  pickerContainer: {
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: "center",
  },
  picker: {
    color: "#fff",
    height: 50,
    width: "100%",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  inputContainer: { flexDirection: "column" },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});