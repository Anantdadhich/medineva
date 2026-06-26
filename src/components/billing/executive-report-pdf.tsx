"use client"

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from "@react-pdf/renderer"

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: "Helvetica",
        fontSize: 10,
        lineHeight: 1.4,
        color: "#1e293b",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 25,
        borderBottomWidth: 2,
        borderBottomColor: "#0f172a",
        paddingBottom: 15,
    },
    titleContainer: {
        flexDirection: "column",
        maxWidth: "60%",
    },
    mainTitle: {
        fontSize: 20,
        fontFamily: "Helvetica-Bold",
        color: "#0f172a",
        letterSpacing: 0.5,
        lineHeight: 1.2,
        marginBottom: 4,
    },
    subTitle: {
        fontSize: 9,
        fontFamily: "Helvetica",
        color: "#64748b",
        letterSpacing: 0.5,
        lineHeight: 1.2,
    },
    metaContainer: {
        flexDirection: "column",
        alignItems: "flex-end",
        maxWidth: "35%",
        textAlign: "right",
    },
    metaLabel: {
        fontSize: 8,
        fontFamily: "Helvetica",
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        lineHeight: 1.2,
        marginBottom: 2,
    },
    metaValue: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        color: "#0f172a",
        lineHeight: 1.2,
        marginBottom: 6,
    },
    metaValueLast: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        color: "#0f172a",
        lineHeight: 1.2,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        color: "#0f172a",
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#cbd5e1",
        paddingBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        lineHeight: 1.2,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    rowLabel: {
        color: "#475569",
        fontSize: 9,
        fontFamily: "Helvetica",
        lineHeight: 1.2,
    },
    rowValue: {
        fontFamily: "Helvetica-Bold",
        color: "#0f172a",
        fontSize: 9,
        lineHeight: 1.2,
    },
    gridContainer: {
        flexDirection: "row",
        gap: 15,
        marginBottom: 20,
    },
    gridCol: {
        flex: 1,
        backgroundColor: "#f8fafc",
        borderRadius: 6,
        padding: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    cardTitle: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: "#0f172a",
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        paddingBottom: 4,
        lineHeight: 1.2,
    },
    // Alert Card (Opportunity Leakage)
    alertCard: {
        backgroundColor: "#fef2f2",
        borderWidth: 1,
        borderColor: "#fecaca",
        borderRadius: 8,
        padding: 15,
        marginTop: 10,
        marginBottom: 20,
    },
    alertHeader: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: "#991b1b",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        lineHeight: 1.2,
    },
    alertDescription: {
        fontSize: 9,
        fontFamily: "Helvetica",
        color: "#7f1d1d",
        lineHeight: 1.4,
    },
    alertValue: {
        fontSize: 14,
        fontFamily: "Helvetica-Bold",
        color: "#b91c1c",
        marginTop: 6,
        lineHeight: 1.2,
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: "#e2e8f0",
        paddingTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    footerText: {
        fontSize: 8,
        fontFamily: "Helvetica",
        color: "#94a3b8",
    }
})

interface ExecutiveReportPDFProps {
    data: any;
    clinicName: string;
}

const formatCurrencyPDF = (amount: any) => {
    const val = Number(amount) || 0
    return `Rs. ${val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function ClinicExecutiveReportPDF({ data, clinicName }: ExecutiveReportPDFProps) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.mainTitle}>Medineva PMS Report</Text>
                        <Text style={styles.subTitle}>EXECUTIVE OPERATIONS & REVENUE STATEMENT</Text>
                    </View>
                    <View style={styles.metaContainer}>
                        <Text style={styles.metaLabel}>Clinic Scope</Text>
                        <Text style={styles.metaValue}>{clinicName}</Text>
                        <Text style={styles.metaLabel}>Report Date</Text>
                        <Text style={styles.metaValueLast}>{new Date().toLocaleDateString('en-IN')}</Text>
                    </View>
                </View>

                {/* Subtitle Details */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "#334155" }}>
                        Selected Audit Window: {data.meta.extractedForPeriod}
                    </Text>
                </View>

                {/* Financials & Operations Grid */}
                <View style={styles.gridContainer}>
                    {/* Column 1: Financial Collections */}
                    <View style={styles.gridCol}>
                        <Text style={styles.cardTitle}>Financial Summary</Text>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Total Billings Issued</Text>
                            <Text style={styles.rowValue}>{formatCurrencyPDF(data.financials.totalBilled)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Collected Cashflow</Text>
                            <Text style={styles.rowValue}>{formatCurrencyPDF(data.financials.totalCollected)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Outstanding Dues</Text>
                            <Text style={styles.rowValue}>{formatCurrencyPDF(data.financials.outstandingDues)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Total Discounts Granted</Text>
                            <Text style={styles.rowValue}>{formatCurrencyPDF(data.financials.totalDiscounts)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Total Invoices Issued</Text>
                            <Text style={styles.rowValue}>{data.financials.invoicesCount || 0} bills</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Average Invoice Value</Text>
                            <Text style={styles.rowValue}>{formatCurrencyPDF(data.financials.averageInvoiceValue)}</Text>
                        </View>
                    </View>

                    {/* Column 2: Payment Mode Breakdown */}
                    <View style={styles.gridCol}>
                        <Text style={styles.cardTitle}>Payment Mode Breakdown</Text>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>UPI route</Text>
                            <Text style={styles.rowValue}>{formatCurrencyPDF(data.financials.upiCollected)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Cash payments</Text>
                            <Text style={styles.rowValue}>{formatCurrencyPDF(data.financials.cashCollected)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Card payments</Text>
                            <Text style={styles.rowValue}>{formatCurrencyPDF(data.financials.cardCollected)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Bank Transfer</Text>
                            <Text style={styles.rowValue}>{formatCurrencyPDF(data.financials.bankTransferCollected)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Insurance & Other</Text>
                            <Text style={styles.rowValue}>{formatCurrencyPDF(data.financials.insuranceCollected + data.financials.otherCollected)}</Text>
                        </View>
                    </View>
                </View>

                {/* Operations Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Clinic Operations & Appointments</Text>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Completed Visits</Text>
                        <Text style={styles.rowValue}>{data.operations.completedSlots} visits</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Active Scheduled Slots</Text>
                        <Text style={styles.rowValue}>{data.operations.scheduledSlots} slots</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Cancelled Slots</Text>
                        <Text style={styles.rowValue}>{data.operations.cancelledSlots} slots</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>No-Show / Missed Slots</Text>
                        <Text style={styles.rowValue}>{data.operations.missedSlots} slots</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>New Patients Registered</Text>
                        <Text style={styles.rowValue}>{data.operations.newPatientsCount || 0} patients</Text>
                    </View>
                </View>

                {/* Analytics Grid */}
                {data.analytics && ((data.analytics.topTreatments && data.analytics.topTreatments.length > 0) || 
                  (data.analytics.doctorSplits && data.analytics.doctorSplits.length > 0)) && (
                    <View style={styles.gridContainer}>
                        {/* Column 1: Top Treatments */}
                        <View style={styles.gridCol}>
                            <Text style={styles.cardTitle}>Top Procedures (By billing)</Text>
                            {data.analytics.topTreatments.length === 0 ? (
                                <Text style={{ fontSize: 9, color: "#94a3b8", fontStyle: "italic", marginTop: 5 }}>No treatments billed</Text>
                            ) : (
                                data.analytics.topTreatments.map((t: any, idx: number) => (
                                    <View key={idx} style={styles.row}>
                                        <Text style={styles.rowLabel}>{t.name}</Text>
                                        <Text style={styles.rowValue}>{formatCurrencyPDF(t.amount)}</Text>
                                    </View>
                                ))
                            )}
                        </View>

                        {/* Column 2: Doctor Contributions */}
                        <View style={styles.gridCol}>
                            <Text style={styles.cardTitle}>Doctor Revenue Contribution</Text>
                            {data.analytics.doctorSplits.length === 0 ? (
                                <Text style={{ fontSize: 9, color: "#94a3b8", fontStyle: "italic", marginTop: 5 }}>No doctor billings</Text>
                            ) : (
                                data.analytics.doctorSplits.map((d: any, idx: number) => (
                                    <View key={idx} style={styles.row}>
                                        <Text style={styles.rowLabel}>{d.name}</Text>
                                        <Text style={styles.rowValue}>{formatCurrencyPDF(d.amount)}</Text>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>
                )}

                {/* Opportunity leakage Alert Card (Hits Doctor Psychology) */}
                <View style={styles.alertCard}>
                    <Text style={styles.alertHeader}>Clinic Revenue Opportunity Leakage Alert</Text>
                    <Text style={styles.alertDescription}>
                        Your clinic lost potential consultations due to cancelled appointments and missed slots (no-shows) within this selection window. This potential uncollected booking flow is estimated below.
                    </Text>
                    <Text style={styles.alertValue}>
                        Estimated Revenue Loss: {formatCurrencyPDF(data.operations.structuralOpportunityLeakage)}
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        System Integrity Validation Ref: {data.meta.timestamp}
                    </Text>
                    <Text style={styles.footerText}>
                        Generated via Medineva Secure PMS Auditing Engine
                    </Text>
                </View>
            </Page>
        </Document>
    )
}
