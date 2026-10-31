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
import api from "@/services/api";

export default function NovoLote() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const loteId = params.id; // Se houver ID, estamos editando!

  const [nome, setNome] = useState("");
  const [dataChegada, setDataChegada] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [finalidade, setFinalidade] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loteId) {
      carregarDadosLote();
    }
  }, [loteId]);

  const carregarDadosLote = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/lotes/${loteId}`);
      const lote = response.data;

      setNome(lote.nome);
      setQuantidade(String(lote.quantidadeInicial));
      setFinalidade(lote.finalidade);

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
    if (!nome || !dataChegada || !quantidade || !finalidade) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos visíveis.");
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
        finalidade,
        linhagem: "Não informada", // Manda um texto padrão para não quebrar a API
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
          placeholder="Ex: Galpão A - Frangos"
          placeholderTextColor="#666"
          value={nome}
          onChangeText={setNome}
        />

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

        <Text style={styles.label}>Finalidade (Opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Corte, Postura, Engorda..."
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
