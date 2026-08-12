import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Dimensions, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { LineChart } from 'react-native-chart-kit'; // Importando o gráfico
import api from '@/services/api';
import DailyModal from '@/components/DailyModal';

// Configuração de Português
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan.','Fev.','Mar','Abr','Mai','Jun','Jul.','Ago','Set.','Out.','Nov.','Dez.'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function AnimalDetails() {
  const { id, name } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [rationAmount, setRationAmount] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [recordId, setRecordId] = useState<number | null>(null)
  const [records, setRecords] = useState<any[]>([])
  const [markedDates, setMarkedDates] = useState<any>({})

  // Estados para o custo e preço
  const [rationPriceKg, setRationPriceKg] = useState('0')
  const [totalFoodGrams, setTotalFoodGrams] = useState(0)
  const [totalCostMonth, setTotalCostMonth] = useState(0)
  const [chartLabels, setChartLabels] = useState<string[]>(['1'])
  const [chartDataValues, setChartDataValues] = useState<number[]>([0])

  // Estados para o Mes e Ano
  const [viewMonth , setViewMonth] = useState(new Date().getMonth() + 1)
  const [viewYear , setViewYear] = useState(new Date().getFullYear())

  const loadData = async () => {
    try {
      // Impede a API de rodar antes do ID da tela estar pronto
      if(!id) return

      const [recordsRes, summaryRes] = await Promise.all([
        api.get(`/dailyrecords/animal/${id}?t=${new Date().getTime()}`),
        api.get(`/dailyrecords/animal/${id}/monthly-summary?month=${viewMonth}&year=${viewYear}&t=${new Date().getTime()}`)
      ])

      const recordsData = recordsRes.data
      setRecords(recordsData)

      const newMarks: any = {}
      recordsData.forEach((record: any) => {
        const dateKey = record.recordDate.split('T')[0]
        newMarks[dateKey] = { marked: true, dotColor: '#4CAF50' }
      })
      setMarkedDates(newMarks)

      const summary = summaryRes.data;
      setTotalFoodGrams(summary.totalFoodGrams)
      setTotalCostMonth(summary.totalCost)
      setRationPriceKg(String(summary.rationPricePerKg))

      //Cria a estrutura completa de dias do mês (ex: 1 até 31)
      const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()
      const fullLabels: string[] = []
      const fullData: number[] = []

      for (let i = 1; i < daysInMonth; i++) {
        // Exibe o número no gráfico apenas a cada 5 dias para não embolar o texto
        if(i === 1 || i % 5 === 0 || i === daysInMonth) {
          fullLabels.push(String(i))
        }else {
          fullLabels.push('')
        }
        // Todo dia começa com 0g de ração
        fullData.push(0)
      }

      //Substitui os valores de 0 pelos dias que o back-end mandou dados
      if (summary.dailyLabels && summary.dailyLabels.length > 0) {
        summary.dailyLabels.forEach((d: any) => {
          const dayIndex = parseInt(d.day) - 1; // Posição no array (Dia 1 fica no index 0)
          if (dayIndex >= 0 && dayIndex < daysInMonth) {
            fullData[dayIndex] = d.foodGrams
          }
        })
      }

      setChartLabels(fullLabels)
      setChartDataValues(fullData)

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  useEffect(() => {
    loadData()
  }, [viewMonth, viewYear, id])

  const handleSavePrice = async () => {
    try {
      await api.put(`/animals/${id}/ration-price`, Number(rationPriceKg),{
        headers: { 'Content-Type': 'application/json' }
    })
      Alert.alert('Sucesso', 'Preço da ração atualizado!')
      await loadData()
    } catch (error) {
      console.error(error)
      Alert.alert('Erro', 'Não foi possível salvar o preço.')
    }
  }

  const handleSaveRecord = async () => {
    if (!rationAmount) return

    try {
      await api.post('/dailyrecords', {
        id: recordId,
        animalId: Number(id),
        foodGiven: Number(rationAmount),
        currentWeight: 0,
        recordDate: selectedDate,
      })

      setModalVisible(false)
      setRationAmount('')
      setRecordId(null)
      await loadData()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    // Usamos ScrollView para a tela inteira rolar
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: name as string, headerShown: true }} />

      {/* --- Dashboard Top --- */}
      <View style={styles.dashboard}>
        {/* Cartão de Preço */}
        <View style={styles.priceCard}>
            <Text style={styles.cardTitle}>Preço da Ração (R$/Kg)</Text>
            <TextInput
                style={styles.priceInput}
                keyboardType="numeric"
                value={rationPriceKg}
                onChangeText={setRationPriceKg}
                placeholder="Ex: 4.80"
            />
            <TouchableOpacity style={styles.savePriceBtn} onPress={handleSavePrice}>
                <Text style={{color: '#fff'}}>Definir Preço</Text>
            </TouchableOpacity>
        </View>

        {/* Cartão de Resumo */}
        <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
                <Text style={styles.label}>Consumo Mês (g)</Text>
                <Text style={styles.value}>{totalFoodGrams} </Text>
            </View>
            <View style={[styles.summaryItem, { borderLeftWidth: 1, borderLeftColor: '#444'}]}>
                <Text style={styles.label}>Gasto Mês (R$)</Text>
                <Text style={[styles.value, { color: '#FFD700' }]}>
                    R$ {totalCostMonth.toFixed(2)}
                </Text>
            </View>
        </View>
      </View>

      {/* --- Gráfico --- */}
      <Text style={styles.sectionTitle}>
        Consumo Diário (g) - {String(viewMonth).padStart(2, '0')}/{viewYear}
      </Text>
      <LineChart
        data={{
          labels: chartLabels,
          datasets: [{ data: chartDataValues }]
        }}
        width={Math.max(Dimensions.get("window").width - 20, 300)} // Largura da tela menos padding
        height={180}
        chartConfig={{
          backgroundColor: "#1e1e1e",
          backgroundGradientFrom: "#1e1e1e",
          backgroundGradientTo: "#1e1e1e",
          decimalPlaces: 0, 
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(170, 170, 170, ${opacity})`,
          propsForDots: { r: "5", strokeWidth: "2", stroke: "#4CAF50"}
        }}
        bezier // Deixa a linha curvada
        style={styles.chart}
      />

      {/* --- Calendário --- */}
      <Text style={styles.sectionTitle}>Registro e Histórico</Text>
      <View style={{ marginBottom: 30 }}>
        <Calendar
            markedDates={markedDates}
            theme={{
            backgroundColor: '#1e1e1e',
            calendarBackground: '#1e1e1e',
            textSectionTitleColor: '#4CAF50',
            selectedDayBackgroundColor: '#4CAF50',
            dayTextColor: '#fff',
            monthTextColor: '#fff',
            }}

            onMonthChange={(month: any) =>{
              setViewMonth(month.month)
              setViewYear(month.year)
            }}

            onDayPress={(day: any) => {
            setSelectedDate(day.dateString);
            const existingRecord = records.find((r: any) => r.recordDate.split('T')[0] === day.dateString);
            if (existingRecord) {
                setRationAmount(String(existingRecord.foodGiven));
                setRecordId(existingRecord.id);
                setIsEditing(true);
            } else {
                setRationAmount('');
                setRecordId(null);
                setIsEditing(false);
            }
            setModalVisible(true);
            }}
        />
      </View>

      <DailyModal
        visible={modalVisible}
        selectedDate={selectedDate}
        isEditing={isEditing}
        rationAmount={rationAmount}
        onChangeRationAmount={setRationAmount}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveRecord}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 10 },
  dashboard: { marginVertical: 10 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginVertical: 15 },
  priceCard: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 12, marginBottom: 10 },
  cardTitle: { color: '#aaa', fontSize: 14, marginBottom: 10 },
  priceInput: { backgroundColor: '#2a2a2a', color: '#fff', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 10 },
  savePriceBtn: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center' },
  summaryCard: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 12, flexDirection: 'row' },
  summaryItem: { flex: 1, alignItems: 'center' },
  label: { color: '#aaa', fontSize: 12, marginBottom: 5 },
  value: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  chart: { marginVertical: 10, borderRadius: 12 },
});