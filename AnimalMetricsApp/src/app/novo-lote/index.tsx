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

  // Tipagem adicionada aqui para o TypeScript parar de reclamar
  const [erros, setErros] = useState<Record<string, string | null>>({});

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
      setFinalidade(lote.finalidade || "");

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

    // Limpa o erro da data assim que o usuário volta a digitar
    if (erros.dataChegada) {
      setErros({ ...erros, dataChegada: null });
    }
  };

  const validarCampos = () => {
    let novosErros: Record<string, string | null> = {};

    if (!nome.trim()) {
      novosErros.nome = "O nome do lote é obrigatório.";
    }

    const regexDataCompleta =
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(20\d{2})$/;

    if (!dataChegada) {
      novosErros.dataChegada = "A data é obrigatória.";
    } else if (!regexDataCompleta.test(dataChegada)) {
      novosErros.dataChegada = "Use o formato DD/MM/AAAA (ex: 31/10/2026).";
    }

    if (!quantidade) {
      novosErros.quantidade = "A quantidade é obrigatória.";
    } else if (Number(quantidade) <= 0) {
      novosErros.quantidade = "A quantidade deve ser maior que zero.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSalvar = async () => {
    if (!validarCampos()) {
      return;
    }

    try {
      setLoading(true);
      setErros({}); // Limpa qualquer erro geral

      const [dia, mes, ano] = dataChegada.split("/");
      const dataIso = `${ano}-${mes}-${dia}T00:00:00Z`;

      const payload = {
        nome,
        dataChegada: dataIso,
        quantidadeInicial: Number(quantidade),
        quantidadeAtual: Number(quantidade),
        finalidade: finalidade.trim() !== "" ? finalidade.trim() : "",
        linhagem: "Não informada",
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
      setErros({
        geral:
          "Ocorreu um erro no servidor. Verifique os dados e tente novamente.",
      });
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
        {erros.geral && (
          <Text style={styles.textoErroGeral}>{erros.geral}</Text>
        )}

        <Text style={styles.label}>Nome de Identificação</Text>
        <TextInput
          style={[styles.input, erros.nome ? styles.inputErro : null]}
          placeholder="Ex: Galpão A - Frangos"
          placeholderTextColor="#666"
          value={nome}
          onChangeText={(texto) => {
            setNome(texto);
            if (erros.nome) setErros({ ...erros, nome: null });
          }}
        />
        {erros.nome && <Text style={styles.textoErro}>{erros.nome}</Text>}

        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Data de Chegada</Text>
            <TextInput
              style={[
                styles.input,
                erros.dataChegada ? styles.inputErro : null,
              ]}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={dataChegada}
              onChangeText={handleDateChange}
            />
            {erros.dataChegada && (
              <Text style={styles.textoErro}>{erros.dataChegada}</Text>
            )}
          </View>

          <View style={[styles.inputContainer, { flex: 1 }]}>
            <Text style={styles.label}>Qtd. Inicial</Text>
            <TextInput
              style={[styles.input, erros.quantidade ? styles.inputErro : null]}
              placeholder="Ex: 500"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={quantidade}
              onChangeText={(texto) => {
                setQuantidade(texto);
                if (erros.quantidade) setErros({ ...erros, quantidade: null });
              }}
            />
            {erros.quantidade && (
              <Text style={styles.textoErro}>{erros.quantidade}</Text>
            )}
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
  inputErro: {
    borderColor: "#ff4444",
    marginBottom: 5,
  },
  textoErro: {
    color: "#ff4444",
    fontSize: 12,
    marginBottom: 15,
    marginLeft: 5,
  },
  textoErroGeral: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
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
