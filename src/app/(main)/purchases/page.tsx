"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useData } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search, Package, AlertTriangle, CheckCircle2,
  TrendingUp, Activity, RefreshCw, ZoomIn, ZoomOut,
  Download, Eye, X, Landmark, CreditCard, Banknote,
  Building2, Tag, FileText, Calendar, Filter, ChevronDown, Check, ArrowUpDown
} from "lucide-react";
import { toast } from "sonner";

interface IntakeItem {
  id: string;
  brandName: string;
  modelName: string;
  categoryId: string;
  categoryName: string;
  serial: string;
  warrantyPeriod: string;
  customWarranty: string;
  costPrice: number | "";
  sellPrice: number | "";
  quantity: number;
}

interface StockIntake {
  id: string;
  timestamp: number;
  date: string;
  supplierId: string;
  supplierName: string;
  billPhoto: string;

  items: IntakeItem[];

  brandName: string;
  modelName: string;
  categoryName: string;
  serial: string;
  warrantyPeriod: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;

  procurementDateTime?: string;
  invoiceId?: string;
  branchName?: string;
  warehouseLocation?: string;
  totalBillAmount?: number;
  advancePayment?: number;
  remainingBalance?: number;
  paymentMethod?: string;
  cardType?: string;
  cardTxRef?: string;
  chequeNumber?: string;
  chequeDate?: string;
  bankTxRef?: string;
  bankAccount?: string;
  paymentStatus?: string;
  discrepancyNotes?: string;
}

const MOCK_BILL_SVG_BOSE = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgMTAwMCIgd2lkdGg9IjEwMCUiPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iMTAwMCIgZmlsbD0iI2ZmZmZmZiIvPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMGYxNzJhIi8+PHRleHQgeD0iNTAiIHk9IjgwIiBmaWxsPSIjZjhmYWZjIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSI4MDAiIGxldHRlci1zcGFjaW5nPSIxIj5FUlAgSU5WRU5UT1JZIFNZU1RFTTwvdGV4dD48dGV4dCB4PSI1MCIgeT0iMTE1IiBmaWxsPSIjOTRhM2I4IiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSI1MDAiPlNVUFBMSUVSIFNUT0NLIElOVEFLRSBMRURHRVI8L3RleHQ+PHRleHQgeD0iNzUwIiB5PSI4MCIgZmlsbD0iI2Y4ZmFmYyIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjMyIiBmb250LXdlaWdodD0iMzAwIiB0ZXh0LWFuY2hvcj0iZW5kIj5JTlZPSUNFPC90ZXh0Pjx0ZXh0IHg9Ijc1MCIgeT0iMTE1IiBmaWxsPSIjZjU5ZTBiIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSI3MDAiIHRleHQtYW5jaG9yPSJlbmQiPiNJTlYtMjAyNi0wMDg5PC90ZXh0Pjx0ZXh0IHg9IjUwIiB5PSIyNDAiIGZpbGw9IiM2NDc0OGIiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZm9udC13ZWlnaHQ9IjcwMCIgbGV0dGVyLXNwYWNpbmc9IjEiPlNVUFBMSUVSPC90ZXh0Pjx0ZXh0IHg9IjUwIiB5PSIyNjUiIGZpbGw9IiMwZjE3MmEiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9IjgwMCI+QWNvdXN0aWMgTGFicyBJbmMuPC90ZXh0Pjx0ZXh0IHg9IjUwIiB5PSIyODUiIGZpbGw9IiM0NzU1NjkiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyI+Q29sb21ibywgU3JpIExhbmthPC90ZXh0Pjx0ZXh0IHg9IjQ1MCIgeT0iMjQwIiBmaWxsPSIjNjQ3NDhiIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxIj5EQVRFICZhbXA7IERFVEFJTFM8L3RleHQ+PHRleHQgeD0iNDUwIiB5PSIyNjUiIGZpbGw9IiMwZjE3MmEiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjYwMCI+RGF0ZTogTWF5IDE4LCAyMDI2PC90ZXh0Pjx0ZXh0IHg9IjQ1MCIgeT0iMjg1IiBmaWxsPSIjNDc1NTY5IiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiPlN0YXR1czogUEFJRCAvIFJFQ0VJVkVEPC90ZXh0PjxsaW5lIHgxPSI1MCIgeTE9IjMzMCIgeDI9Ijc1MCIgeTI9IjMzMCIgc3Ryb2tlPSIjZTJlOGYwIiBzdHJva2Utd2lkdGg9IjEuNSIvPjx0ZXh0IHg9IjUwIiB5PSUzNzAiIGZpbGw9IiM2NDc0OGIiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9IjcwMCI+REVTQ1JJUFRJT048L3RleHQ+PHRleHQgeD0iNDUwIiB5PSUzNzAiIGZpbGw9IiM2NDc0OGIiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9IjcwMCIgdGV4dC1hbmNob3I9ImVuZCI+UVRZPC90ZXh0Pjx0ZXh0IHg9IjYwMCIgeT0iMzcwIiBmaWxsPSIjNjQ3NDhiIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSI3MDAiIHRleHQtYW5jaG9yPSJlbmQiPlVOSVQgQ09TVCAoTEtSKTwvdGV4dD48dGV4dCB4PSI3NTAiIHk9Ij3NzAiIGZpbGw9IiM2NDc0OGIiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9IjcwMCIgdGV4dC1hbmNob3I9ImVuZCI+VE9UQUwgKExLUik8L3RleHQ+PGxpbmUgeDE9IjUwIiB5MT0iMzkwIiB4Mj0iNzUwIiB5Mj0iMzkwIiBzdHJva2U9IiMwZjE3MmEiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjUwIiB5PSI0MzAiIGZpbGw9IiMwZjE3MmEiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjcwMCI+Qm9zZSBRdWlldENvbWZvcnQgVWx0cmEgSGVhZHBob25lczwvdGV4dD48dGV4dCB4PSI1MCIgeT0iNDUwIiBmaWxsPSIjNjQ3NDhiIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiPlMvTjogUUMtOTA4Mi1BIMK3IENhdDogQXVkaW8gwrcgV2FycmFudHk6IDEgWWVhcjwvdGV4dD48dGV4dCB4PSI0NTAiIHk9IjQzMCIgZmlsbD0iIzBfMTcyYSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iNjAwIiB0ZXh0LWFuY2hvcj0iZW5kIj4xNTwvdGV4dD48dGV4dCB4PSI2MDAiIHk9IjQzMCIgZmlsbD0iIzBmMTcyYSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iNjAwIiB0ZXh0LWFuY2hvcj0iZW5kIj5Scy4gOTgsNTAwLjAwPC90ZXh0Pjx0ZXh0IHg9Ijc1MCIgeT0iNDMwIiBmaWxsPSIjMGYxNzJhIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSI4MDAiIHRleHQtYW5jaG9yPSJlbmQiPlJzLiAxLDQ3Nyw1MDAuMDA8L3RleHQ+PGxpbmUgeDE9IjUwIiB5MT0iNDgwIiB4Mj0iNzUwIiB5Mj0iNDgwIiBzdHJva2U9IiNmMWY1ZjkiIHN0cm9rZS13aWR0aD0iMSIvPjx0ZXh0IHg9IjUwIiB5PSI1MjAiIGZpbGw9IiMwZjE3MmEiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjcwMCI+U29ueSBXSC0xMDAwWE01IEFOQyBIZWFkcGhvbmVzPC90ZXh0Pjx0ZXh0IHg9IjUwIiB5PSI1NDAiIGZpbGw9IiM2NDc0OGIiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSI+Uy9OOiBTTi1YTTUtODgyIMK3IENhdDogQXVkaW8gwrcgV2FycmFudHk6IDIgWWVhcnM8L3RleHQ+PHRleHQgeD0iNDUwIiB5PSI1MjAiIGZpbGw9IiMwZjE3MmEiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjYwMCIgdGV4dC1hbmNob3I9ImVuZCI+MjA8L3RleHQ+PHRleHQgeD0iNjAwIiB5PSI1MjAiIGZpbGw9IiMwZjE3MmEiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjYwMCIgdGV4dC1hbmNob3I9ImVuZCI+UnMuIDg1LDAwMC4wMDwvdGV4dD48dGV4dCB4IHg9Ijc1MCIgeT0iNTIwIiBmaWxsPSIjMGYxNzJhIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSI4MDAiIHRleHQtYW5jaG9yPSJlbmQiPlJzLiAxLDcwMCwwMDAuMDA8L3RleHQ+PGxpbmUgeDE9IjQwMCIgeTE9IjU2MCIgeDI9Ijc1MCIgeTI9IjU2MCIgc3Ryb2tlPSIjMGYxNzJhIiBzdHJva2Utd2lkdGg9IjEuNSIvPjx0ZXh0IHg9IjYwMCIgeT0iNjAwIiBmaWxsPSIjNjQ3NDhiIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSI3MDAiIHRleHQtYW5jaG9yPSJlbmQiPlN1YnRvdGFsOjwvdGV4dD48dGV4dCB4PSI3NTAiIHk9IjYwMCIgZmlsbD0iIzBmMTcyYSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iNzAwIiB0ZXh0LWFuY2hvcj0iZW5kIj5Scy4gMywxNzcsNTAwLjAwPC90ZXh0Pjx0ZXh0IHg9IjYwMCIgeT0iNjM1IiBmaWxsPSIjNjQ3NDhiIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSI3MDAiIHRleHQtYW5jaG9yPSJlbmQiPlZBVCAoMTglKTo8L3RleHQ+PHRleHQgeD0iNzUwIiB5PSI2MzUiIGZpbGw9IiMwZjE3MmEiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjcwMCIgdGV4dC1hbmNob3I9ImVuZCI+UnMuIDU3MSw5NTAuMDA8L3RleHQ+PGxpbmUgeDE9IjQwMCIgeTE9IjY2NSIgeDI9Ijc1MCIgeTI9IjY2NSIgc3Ryb2tlPSIjMGYxNzJhIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSI2MDAiIHk9IjcwNSIgZmlsbD0iIzBmMTcyYSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iODAwIiB0ZXh0LWFuY2hvcj0iZW5kIj5UT1RBTCBEVUU6PC90ZXh0Pjx0ZXh0IHg9Ijc1MCIgeT0iNzA1IiBmaWxsPSIjZjU5ZTBiIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjIiIGZvbnQtd2VpZ2h0PSI5MDAiIHRleHQtYW5jaG9yPSJlbmQiPlJzLiAzLDc0OSw0NTAuMDA8L3RleHQ+PHJlY3QgeD0iNTAiIHk9IjgwMCIgd2lkdGg9IjcwMCIgaGVpZ2h0PSI2MCIgcng9IjgiIGZpbGw9IiNmOGZhZmMiIHN0cm9rZT0iI2UyZThmMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PHRleHQgeD0iNDAwIiB5PSI4MzUiIGZpbGw9IiM2NDc0OGIiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9IjUwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGhhbmsgeW91IGZvciB5b3VyIGJ1c2luZXNzLiBGb3IgY29tcGxpYW5jZSBxdWVyaWVzLCByZWFjaCBzdXBwb3J0QGFjb3VzdGljbGFicy5jb208L3RleHQ+PC9zdmc+`;

const MOCK_BILL_SVG_SONY = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgMTAwMCIgd2lkdGg9IjEwMCUiPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iMTAwMCIgZmlsbD0iI2ZmZmZmZiIvPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMWUzYThhIi8+PHRleHQgeD0iNTAiIHk9IjgwIiBmaWxsPSIjZjhmYWZjIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSI4MDAiIGxldHRlci1zcGFjaW5nPSIxIj5ORVhVUyBFTEVDVFJPTklDUyBFUlA8L3RleHQ+PHRleHQgeD0iNTAiIHk9IjExNSIgZmlsbD0iIzkzYzVmZCIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iNTAwIj5TVVBQTElFUiBTVVBQTFkgJmFtcDsgSU5UQUtFIFNVTU1BUlk8L3RleHQ+PHRleHQgeD0iNzUwIiB5PSI4MCIgZmlsbD0iI2Y4ZmFmYyIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjMyIiBmb250LXdlaWdodD0iMzAwIiB0ZXh0LWFuY2hvcj0iZW5kIj5CSUxMIElOVEFLRTwvdGV4dD48dGV4dCB4PSI3NTAiIHk9IjExNSIgZmlsbD0iIzEwYjk4MSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iNzAwIiB0ZXh0LWFuY2hvcj0iZW5kIj4jTlhTLTIwMjYtOTA0MjwvdGV4dD48dGV4dCB4PSI1MCIgeT0iMjQwIiBmaWxsPSIjNjQ3NDhiIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxIj5TVVBQTElFUjwvdGV4dD48dGV4dCB4PSI5NCIgeT0iMjY1IiBmaWxsPSIjMGYxNzJhIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSI4MDAiPk5leHVzIEVsZWN0cm9uaWNzPC90ZXh0Pjx0ZXh0IHg9IjUwIiB5PSIyODUiIGZpbGw9IiM0NzU1NjkiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyI+Q29sb21ibyAwMywgU3JpIExhbmthPC90ZXh0Pjx0ZXh0IHg9IjQ1MCIgeT0iMjQwIiBmaWxsPSIjNjQ3NDhiIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxIj5EQVRFICZhbXA7IENPTVBMSUFOQ0U8/Njg1IiB4Mj0iNzUwIiB5Mj0iNjY1IiBzdHJva2U9IiMxZTNhOGEiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjYwMCIgeT0iNjI1IiBmaWxsPSIjMGYxNzJhIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSI4MDAiIHRleHQtYW5jaG9yPSJlbmQiPlRPVEFMIERVRTo8L3RleHQ+PHRleHQgeD0iNzUwIiB5PSI2MjUiIGZpbGw9IiMxMGI5ODEiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMiIgZm9udC13ZWlnaHQ9IjkwMCIgdGV4dC1hbmNob3I9ImVuZCI+UnMuIDIsMDA2LDAwMC4wMDwvdGV4dD48cmVjdCB4PSI1MCIgeT0iNzIwIiB3aWR0aD0iNzAwIiBoZWlnaHQ9IjYwIiByeD0iOCIgZmlsbD0iI2YwZmRmNCIgc3Ryb2tlPSIjYmJmN2QwIiBzdHJva2Utd2lkdGg9IjEiLz48dGV4dCB4PSI0MDAiIHk9Ijc1NSIgZmlsbD0iIzE2NjUzNCIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iNTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Db21wbGlhbmNlIGRvY3VtZW50IHN0b3JlZCBpbiBzZWN1cmUgY2xvdWQgbm9kZXMuIFZlcmlmaWVkIGJ5IE5leHVzIExlZ2FsLjwvdGV4dD48L3N2Zz4=`;

const MOCK_BILL_SVG_APPLE = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgMTAwMCIgd2lkdGg9IjEwMCUiPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iMTAwMCIgZmlsbD0iI2ZmZmZmZiIvPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMDkwOTBiIi8+PHRleHQgeD0iNTAiIHk9IjgwIiBmaWxsPSIjZjRmNGY1IiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSI4MDAiIGxldHRlci1zcGFjaW5nPSIxIj5BUEVYIExPR0lTVElDUyAmYW1wOyBHT09EUzwvdGV4dD48dGV4dCB4PSI5NCIgeT0iMTE1IiBmaWxsPSIjYTFhMWFhIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSI1MDAiPkVMRUNUUk9OSUMgU1VQUExZIERJU1BBVENIPC90ZXh0Pjx0ZXh0IHg9Ijc1MCIgeT0iODAiIGZpbGw9IiNmNGY0ZjUiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMiIgZm9udC13ZWlnaHQ9IjMwMCIgdGV4dC1hbmNob3I9ImVuZCI+TEVER0VSIElOVEFLRTwvdGV4dD48dGV4dCB4PSI3NTAiIHk9IjExNSIgZmlsbD0iI2U0ZTRlNyIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iNzAwIiB0ZXh0LWFuY2hvcj0iZW5kIj4jQVBYLTIwMjYtMzM5MjwvdGV4dD48dGV4dCB4PSI1MCIgeT0iMjQwIiBmaWxsPSIjNzE3MTdhIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxIj5TVVBQTElFUjwvdGV4dD48dGV4dCB4PSI1MCIgeT0iMjY1IiBmaWxsPSIjMDkwOTBiIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSI4MDAiPkFwZXggTG9naXN0aWNzPC90ZXh0Pjx0ZXh0IHg9IjUwIiB5PSIyODUiIGZpbGw9IiMyNzI3MmEiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyI+S2FuZHksIFNyaSBMYW5rYTwvdGV4dD48dGV4dCB4PSI0NTAiIHk9IjI0MCIgZmlsbD0iHzcxNzE3YSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmb250LXdlaWdodD0iNzAwIiBsZXR0ZXItc3BhY2luZz0iMSI+REFURSAmYW1wOyBTSElQTUVOVDwvdGV4dD48dGV4dCB4PSI0NTAiIHk9IjI2NSIgZmlsbD0iIzA5MDkwYiIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iNjAwIj5EYXRlOiBNYXkgMDUsIDIwMjY8L3RleHQ+PHRleHQgeD0iNDUwIiB5PSIyODUiIGZpbGw9IiMyNzI3MmEiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyI+U3RhdHVzOiBDT01QTEVURUQgLyBJTiBTVE9DSzwvdGV4dD48bGluZSB4MT0iNTAiIHkxPSUzMzAiIHgyPSI3NTAiIHkyPSUzMzAiIHN0cm9rZT0iI2U0ZTRlNyIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48dGV4dCB4PSI1MCIgeT0iMzcwIiBmaWxsPSIjNzE3MTdhIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSI3MDAiPkRFU0NSSVBUSU9OPC90ZXh0Pjx0ZXh0IHg9IjQ1MCIgeT0iMzcwIiBmaWxsPSIjNzE3MTdhIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSI3MDAiIHRleHQtYW5jaG9yPSJlbmQiPlFUWTwvdGV4dD48dGV4dCB4PSI2MDAiIHk9Ij3NzAiIGZpbGw9IiM3MTcxN2EiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9IjcwMCIgdGV4dC1hbmNob3I9ImVuZCI+VU5JVCBDT1NUIChMS1IpPC90ZXh0Pjx0ZXh0IHg9Ijc1MCIgeT0iMzcwIiBmaWxsPSIjNzE3MTdhIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSI3MDAiIHRleHQtYW5jaG9yPSJlbmQiPlRPVEFMIChMS1IpPC90ZXh0PjxsaW5lIHgxPSI1MCIgeTE9IjM5MCIgeDI9Ijc1MCIgeTI9IjM5MCIgc3Ryb2tlPSIjMDkwOTBiIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSI1MCIgeT0iNDMwIiBmaWxsPSIjMDkwOTBiIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSI3MDAiPkFwcGxlIGlQYWQgQWlyIE0yICgxMS1pbmNoKTwvdGV4dD48dGV4dCB4PSI1MCIgeT0iNDUwIiBmaWxsPSIjNzE3MTdhIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiPlMvTjogQVBMLU0yLTc3MSDCtyBDYXQ6IFRhYmxldHMgTThnIFdhcnJhbnR5OiAxIFllYXI8L3RleHQ+PHRleHQgeD0iNDUwIiB5PSI0MzAiIGZpbGw9IiMwOTA5MGIiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjYwMCIgdGV4dC1hbmNob3I9ImVuZCI+ODwvdGV4dD48dGV4dCB4PSI2MDAiIHk9IjQzMCIgZmlsbD0iIzA5MDkwYiIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iNjAwIiB0ZXh0LWFuY2hvcj0iZW5kIj5Scy4gMTg1LDAwMC4wMDwvdGV4dD48dGV4dCB4IHg9Ijc1MCIgeT0iNDMwIiBmaWxsPSIjMDkwOTBiIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSI4MDAiIHRleHQtYW5jaG9yPSJlbmQiPlJzLiAxLDQ4MCwwMDAuMDA8L3RleHQ+PGxpbmUgeDE9IjQwMCIgeTE9IjQ4MCIgeDI9Ijc1MCIgeTI9IjQ4MCIgc3Ryb2tlPSIjMDkwOTBiIiBzdHJva2Utd2lkdGg9IjEuNSIvPjx0ZXh0IHg9IjYwMCIgeT0iNTIwIiBmaWxsPSIjNzE3MTdhIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSI3MDAiIHRleHQtYW5jaG9yPSJlbmQiPlN1YnRvdGFsOjwvdGV4dD48dGV4dCB4PSI3NTAiIHk9IjUyMCIgZmlsbD0iIzA5MDkwYiIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iNzAwIiB0ZXh0LWFuY2hvcj0iZW5kIj5Scy4gMSw0ODAsMDAwLjAwPC90ZXh0Pjx0ZXh0IHg9IjYwMCIgeT0iNTU1IiBmaWxsPSIjNzE3MTdhIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSI3MDAiIHRleHQtYW5jaG9yPSJlbmQiPlZBVCAoMTglKTo8L3RleHQ+PHRleHQgeD0aNzUwIiB5PSI1NTUiIGZpbGw9IiMwOTA5MGIiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjcwMCIgdGV4dC1hbmNob3I9ImVuZCI+UnMuIDI2Niw0MDAuMDA8L3RleHQ+PGxpbmUgeDE9IjQwMCIgeTE9IjU4NSIgeDI9Ijc1MCIgeTI9IjU4NSIgc3Ryb2tlPSIjMDkwOTBiIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSI2MDAiIHk9IjYyNSIgZmlsbD0iIzA5MDkwYiIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iODAwIiB0ZXh0LWFuY2hvcj0iZW5kIj5UT1RBTCBEVUU6PC90ZXh0Pjx0ZXh0IHg9Ijc1MCIgeT0iNjI1IiBmaWxsPSIjMDkwOTBiIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjIiIGZvbnQtd2VpZ2h0PSI5MDAiIHRleHQtYW5jaG9yPSJlbmQiPlJzLiAxLDc0Niw0MDAuMDA8L3RleHQ+PHJlY3QgeD0iNTAiIHk9IjcyMCIgd2lkdGg9IjcwMCIgaGVpZ2h0PSI2MCIgcng9IjgiIGZpbGw9IiNmYWZhZmEiIHN0cm9rZT0iI2U0ZTRlNyIgc3Ryb2tlLXdpZHRoPSIxIi8+PHRleHQgeD0iNDAwIiB5PSI3NTUiIGZpbGw9IiMyNzI3MmEiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9IjUwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+T2ZmaWNpYWwgZGlzcGF0Y2ggdmVyaWZpZWQgYnkgQXBwbGUgU3JpIExhbmthIERpc3RyaWJ1dGlvbiwgSHViLjwvdGV4dD48L3N2Zz4=`;

function getBillPhotoFallback(bill: any) {
  if (!bill) return MOCK_BILL_SVG_BOSE;
  if (bill.billPhoto) return bill.billPhoto;
  
  const supplier = (bill.supplierName || "").toLowerCase();
  const itemsText = (bill.items || []).map((it: any) => (it.brandName || "") + " " + (it.modelName || "")).join(" ").toLowerCase();
  
  if (supplier.includes("nexus") || itemsText.includes("sony")) {
    return MOCK_BILL_SVG_SONY;
  }
  if (supplier.includes("apex") || itemsText.includes("apple") || itemsText.includes("ipad")) {
    return MOCK_BILL_SVG_APPLE;
  }
  return MOCK_BILL_SVG_BOSE;
}

function sanitizeIntakeLog(log: any): StockIntake {
  if (log.items && Array.isArray(log.items)) {
    return log as StockIntake;
  }
  const legacyItem: IntakeItem = {
    id: `item-legacy-${log.id}`,
    brandName: log.brandName || "Unknown",
    modelName: log.modelName || "Item",
    categoryId: "",
    categoryName: log.categoryName || "Uncategorized",
    serial: log.serial || "N/A",
    warrantyPeriod: log.warrantyPeriod || "1 Year",
    customWarranty: "",
    costPrice: log.costPrice ? Number(log.costPrice) : 0,
    sellPrice: log.sellPrice ? Number(log.sellPrice) : 0,
    quantity: log.quantity ? Number(log.quantity) : 1
  };
  return {
    ...log,
    costPrice: log.costPrice ? Number(log.costPrice) : 0,
    sellPrice: log.sellPrice ? Number(log.sellPrice) : 0,
    quantity: log.quantity ? Number(log.quantity) : 1,
    totalBillAmount: log.totalBillAmount !== undefined && log.totalBillAmount !== null ? Number(log.totalBillAmount) : (Number(log.costPrice || 0) * Number(log.quantity || 1)),
    remainingBalance: log.remainingBalance !== undefined && log.remainingBalance !== null ? Number(log.remainingBalance) : Math.max(0, (Number(log.costPrice || 0) * Number(log.quantity || 1)) - Number(log.advancePayment || 0)),
    items: [legacyItem],
  };
}

export default function PurchasingHistoryPage() {
  const { ready } = useData();

  // DB Intakes logs
  const [intakesHistory, setIntakesHistory] = useState<StockIntake[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Premium Modal Lightbox State
  const [activeLightboxBill, setActiveLightboxBill] = useState<StockIntake | null>(null);
  const [lightboxScale, setLightboxScale] = useState(1);

  // Fetch real data from the database
  const loadIntakes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stock-intakes', { headers: { 'x-tenant-id': 'cmpc620w20007ezgn2axsmt9p' } });
      if (!res.ok) throw new Error("Failed to fetch intakes");
      const data = await res.json();
      
      const dbItems: StockIntake[] = data.map((item: any) => sanitizeIntakeLog(item));
      dbItems.sort((a, b) => b.timestamp - a.timestamp);
      setIntakesHistory(dbItems);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load historical database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready) {
      loadIntakes();
    }
  }, [ready]);

  // Dynamic calculations for the top statistics overview row
  const stats = useMemo(() => {
    let totalCost = 0;
    let outstandingDue = 0;
    let ordersThisMonth = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    intakesHistory.forEach((log) => {
      // 1. Total Cost
      const cost = log.totalBillAmount !== undefined ? log.totalBillAmount : (log.costPrice * log.quantity);
      totalCost += cost;

      // 2. Outstanding Due
      const due = log.remainingBalance !== undefined ? log.remainingBalance : 0;
      outstandingDue += due;

      // 3. Orders this month
      const logDate = log.procurementDateTime ? new Date(log.procurementDateTime) : new Date(log.timestamp);
      if (logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear) {
        ordersThisMonth += 1;
      }
    });

    return { totalCost, outstandingDue, ordersThisMonth };
  }, [intakesHistory]);

  // Filter and search logic
  const filteredIntakes = useMemo(() => {
    return intakesHistory.filter((log) => {
      // Text Search: ID, Supplier Name, Brand, Model
      const q = searchQuery.toLowerCase();
      const invoiceMatch = log.invoiceId ? log.invoiceId.toLowerCase().includes(q) : false;
      const supplierMatch = log.supplierName ? log.supplierName.toLowerCase().includes(q) : false;
      
      const itemMatch = log.items?.some(it => 
        (it.brandName && it.brandName.toLowerCase().includes(q)) || 
        (it.modelName && it.modelName.toLowerCase().includes(q))
      ) || (log.brandName && log.brandName.toLowerCase().includes(q)) || (log.modelName && log.modelName.toLowerCase().includes(q));

      const matchesSearch = !searchQuery || invoiceMatch || supplierMatch || itemMatch;

      // Payment Status Filter
      let matchesStatus = true;
      if (statusFilter !== "All") {
        if (statusFilter === "Fully Paid") {
          matchesStatus = log.paymentStatus === "Fully Paid";
        } else if (statusFilter === "Partially Paid") {
          matchesStatus = log.paymentStatus === "Partially Paid";
        } else if (statusFilter === "Credit / Pending") {
          matchesStatus = log.paymentStatus === "Credit / Pending" || log.paymentStatus === "Credit";
        }
      }

      // Date Range Filter
      let matchesDate = true;
      const recordDate = log.procurementDateTime ? new Date(log.procurementDateTime) : new Date(log.timestamp);
      recordDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === "Today") {
        matchesDate = recordDate.getTime() === today.getTime();
      } else if (dateFilter === "This Week") {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        matchesDate = recordDate >= startOfWeek && recordDate <= today;
      } else if (dateFilter === "This Month") {
        matchesDate = recordDate.getMonth() === today.getMonth() && recordDate.getFullYear() === today.getFullYear();
      } else if (dateFilter === "Custom") {
        if (customStartDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && recordDate >= start;
        }
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && recordDate <= end;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [intakesHistory, searchQuery, statusFilter, dateFilter, customStartDate, customEndDate]);

  // Clean values from empty arrays/items
  const totalItemsCount = (log: StockIntake) => {
    if (log.items && log.items.length > 0) {
      return log.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    }
    return log.quantity || 1;
  };

  return (
    <div className="space-y-8 bg-[#F8FAFC] dark:bg-[#09090b] min-h-[85vh] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-zinc-900 transition-colors duration-300">
      
      {/* Page Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">Procurement Ledger</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Audit log of all historical supplier deliveries, intake details, and compliance billing assets.</p>
        </div>
        <Button 
          onClick={loadIntakes}
          variant="outline" 
          size="sm"
          className="self-start sm:self-center h-9 px-4 text-xs font-bold uppercase tracking-wider rounded-xl gap-2 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all border-slate-200 dark:border-zinc-800 shadow-sm shrink-0"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </Button>
      </div>

      {/* 1. Top Stats Overview (Summary Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Cost Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 border border-slate-200/60 dark:border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.015)] group transition-all hover:shadow-md hover:border-slate-300/80 dark:hover:border-zinc-700/85">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-24 w-24 text-emerald-500" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Total Procurement Cost</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-zinc-55 font-mono">
              Rs. {stats.totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Cumulative ledger total
            </p>
          </div>
        </div>

        {/* Outstanding due card */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 border border-slate-200/60 dark:border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.015)] group transition-all hover:shadow-md hover:border-slate-300/80 dark:hover:border-zinc-700/85">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Activity className="h-24 w-24 text-amber-500" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-650 dark:text-amber-400">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Outstanding Due</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-zinc-55 font-mono">
              Rs. {stats.outstandingDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1.5 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Outstanding accounts due
            </p>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 border border-slate-200/60 dark:border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.015)] group transition-all hover:shadow-md hover:border-slate-300/80 dark:hover:border-zinc-700/85">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Package className="h-24 w-24 text-primary" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Orders This Month</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-zinc-55 font-mono">
              {stats.ordersThisMonth} Orders
            </h3>
            <p className="text-[10px] text-primary font-bold mt-1.5 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Within current calendar month
            </p>
          </div>
        </div>
      </div>

      {/* 2. Advanced Filter & Search Bar */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.01)] space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          
          {/* Search bar inputs */}
          <div className="lg:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-55 pointer-events-none" />
            <Input 
              type="text"
              placeholder="Search by Invoice ID, Supplier Name, or Product Spec..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800 focus:border-slate-350 dark:focus:border-zinc-700 font-medium text-xs text-slate-800 dark:text-zinc-200"
            />
          </div>

          {/* Payment Status Dropdown Dropdowns */}
          <div className="lg:col-span-3 flex flex-col gap-1.5 text-left">
            <Label className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider">Payment Status</Label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 pr-8 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 outline-none appearance-none cursor-pointer focus:border-slate-300 transition-colors"
              >
                <option value="All">All Payment States</option>
                <option value="Fully Paid">Fully Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Credit / Pending">Credit / Pending</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-55 pointer-events-none" />
            </div>
          </div>

          {/* Date range dropdowns */}
          <div className="lg:col-span-3 flex flex-col gap-1.5 text-left">
            <Label className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider">Date Intakes Range</Label>
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full h-10 px-3 pr-8 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 outline-none appearance-none cursor-pointer focus:border-slate-300 transition-colors"
              >
                <option value="All">All Recorded Dates</option>
                <option value="Today">Today Only</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Custom">Custom Date Range...</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-55 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Custom date range row */}
        {dateFilter === "Custom" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 animate-in slide-in-from-top-1 duration-200">
            <div className="flex flex-col gap-1.5 text-left">
              <Label className="text-[9px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-widest">Start Date</Label>
              <Input 
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="h-10 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800 text-xs font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <Label className="text-[9px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-widest">End Date</Label>
              <Input 
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-10 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800 text-xs font-medium"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Purchasing History Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-[0_4px_24px_rgba(0,0,0,0.015)] overflow-hidden">
        
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4 text-slate-400 dark:text-zinc-500">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs font-bold uppercase tracking-wider">Syncing historical records...</p>
          </div>
        ) : filteredIntakes.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-zinc-500">
            <Package className="h-10 w-10 text-slate-300 dark:text-zinc-800" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-350 uppercase tracking-wide">No Intakes Found</h4>
            <p className="text-xs max-w-[280px] text-center leading-relaxed">No matching stock delivery logs match your filter queries or database is empty.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto no-scrollbar">
            <table className="w-full table-auto divide-y divide-slate-100 dark:divide-zinc-850">
              <thead className="bg-slate-50/50 dark:bg-zinc-950/40">
                <tr className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider border-b border-slate-200/40 dark:border-zinc-800/60">
                  <th className="px-6 py-4 text-left font-black">Date &amp; Time</th>
                  <th className="px-6 py-4 text-left font-black">Invoice Ref ID</th>
                  <th className="px-6 py-4 text-left font-black">Supplier Name</th>
                  <th className="px-6 py-4 text-center font-black">Total Items</th>
                  <th className="px-6 py-4 text-right font-black">Grand Total (LKR)</th>
                  <th className="px-6 py-4 text-center font-black">Status</th>
                  <th className="px-6 py-4 text-center font-black w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                {filteredIntakes.map((log) => {
                  const billSum = log.totalBillAmount !== undefined ? log.totalBillAmount : (log.costPrice * log.quantity);
                  
                  return (
                    <tr 
                      key={log.id} 
                      className="text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-50/40 dark:hover:bg-zinc-950/10 transition-colors"
                    >
                      {/* Date & Time */}
                      <td className="px-6 py-4 text-left font-mono font-bold whitespace-nowrap text-slate-800 dark:text-zinc-200">
                        {log.procurementDateTime 
                          ? new Date(log.procurementDateTime).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
                          : log.date
                        }
                      </td>

                      {/* Invoice Ref ID */}
                      <td className="px-6 py-4 text-left font-mono font-extrabold text-slate-900 dark:text-zinc-50 whitespace-nowrap">
                        {log.invoiceId || "INV-INTAKE-LEGACY"}
                      </td>

                      {/* Supplier Name */}
                      <td className="px-6 py-4 text-left text-slate-800 dark:text-zinc-200 font-extrabold whitespace-nowrap">
                        {log.supplierName || "Unknown Supplier"}
                      </td>

                      {/* Total Items (Qty) */}
                      <td className="px-6 py-4 text-center font-mono font-extrabold text-slate-650 dark:text-zinc-350">
                        {totalItemsCount(log)} items
                      </td>

                      {/* Grand Total */}
                      <td className="px-6 py-4 text-right font-mono font-black text-slate-900 dark:text-zinc-50 whitespace-nowrap">
                        Rs. {billSum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>

                      {/* Status Badges */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          log.paymentStatus === "Fully Paid" 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-950/30"
                            : log.paymentStatus === "Partially Paid"
                              ? "bg-amber-50 text-amber-600 border-amber-100/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-950/30"
                              : "bg-rose-50 text-rose-600 border-rose-100/50 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-950/30"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            log.paymentStatus === "Fully Paid" 
                              ? "bg-emerald-500" 
                              : log.paymentStatus === "Partially Paid"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                          }`} />
                          {log.paymentStatus || "Fully Paid"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveLightboxBill(log);
                            setLightboxScale(1);
                          }}
                          className="h-7 text-[10px] font-bold uppercase tracking-wider px-2.5 border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-all gap-1.5 rounded-xl shrink-0"
                        >
                          <Eye className="h-3 w-3 text-primary" /> View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==========================================
          PREMIUM LIGHTBOX OVERLAY MODAL
         ========================================== */}
      {activeLightboxBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          
          {/* Modal Box */}
          <div className="relative w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] border border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-1 md:grid-cols-2 max-h-[90vh] md:h-[85vh] overflow-y-auto md:overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Left Box: SVG Bill Photo Zoomer */}
            <div className="overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex flex-col relative h-[320px] md:h-full shrink-0">
              
              {/* Decorative premium watermark */}
              <div className="absolute bottom-4 left-6 z-10 pointer-events-none select-none">
                <span className="text-[9px] font-mono tracking-[0.2em] text-zinc-400/80 uppercase">
                  Audit Node: Verified Secure // {activeLightboxBill.id.substring(0, 8).toUpperCase()}
                </span>
              </div>

              {/* Floating controls */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-xl px-2 py-1.5 rounded-2xl border border-white/10 shadow-lg shrink-0">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-all shrink-0"
                  onClick={() => setLightboxScale(prev => Math.min(2.5, prev + 0.25))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-all shrink-0"
                  onClick={() => setLightboxScale(prev => Math.max(0.5, prev - 0.25))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <a 
                  href={getBillPhotoFallback(activeLightboxBill)} 
                  download={`invoice_${activeLightboxBill.invoiceId || 'LOG'}.svg`}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white transition-colors shrink-0"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>

              {/* Invoice Image wrapper */}
              <div className="flex-1 overflow-auto no-scrollbar p-6 flex items-center justify-center min-h-0">
                <div 
                  className="transition-transform duration-300 ease-out origin-center flex items-center justify-center shadow-2xl border border-zinc-800 rounded-2xl overflow-hidden bg-white max-w-full max-h-full"
                  style={{ transform: `scale(${lightboxScale})` }}
                >
                  <img 
                    src={getBillPhotoFallback(activeLightboxBill)} 
                    alt="Supplier stock intake purchase invoice" 
                    className="max-h-[220px] md:max-h-[65vh] max-w-[80vw] md:max-w-full object-contain transition-transform"
                  />
                </div>
              </div>
            </div>

            {/* Right Box: Highly Designed ERP Billing compliance sheet */}
            <div className="w-full border-t md:border-t-0 md:border-l border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 sm:p-6 md:p-8 flex flex-col justify-between h-auto md:h-full md:overflow-y-auto no-scrollbar">
              
              <div className="space-y-4 sm:space-y-6 text-left">
                
                {/* Header title */}
                <div className="flex items-start justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5 shrink-0">
                  <div className="min-w-0 space-y-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-950/30 px-3 py-1 rounded-full tracking-wider border border-emerald-100/50">
                      <span className="relative flex h-1.5 w-1.5 mr-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      Log Asset Verification
                    </span>
                    <h3 className="text-xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight leading-tight flex items-center gap-2 flex-wrap">
                      <span className="truncate max-w-[200px] sm:max-w-none">
                        {activeLightboxBill.items && activeLightboxBill.items.length > 0
                          ? `${activeLightboxBill.items[0].brandName} ${activeLightboxBill.items[0].modelName}`
                          : `${activeLightboxBill.brandName} ${activeLightboxBill.modelName}`
                        }
                      </span>
                      {activeLightboxBill.items && activeLightboxBill.items.length > 1 && (
                        <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block shrink-0 uppercase tracking-wider">
                          + {activeLightboxBill.items.length - 1} other{activeLightboxBill.items.length - 1 > 1 ? "s" : ""}
                        </span>
                      )}
                    </h3>
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono tracking-widest uppercase truncate">Intake ID: {activeLightboxBill.id.substring(0, 16).toUpperCase()}</p>
                  </div>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setActiveLightboxBill(null)}
                    className="h-9 w-9 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 shrink-0 self-start transition-all"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Procurement details */}
                <div className="space-y-2.5">
                  <span className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] block">Procurement Details</span>
                  <div className="grid grid-cols-2 gap-4 p-4.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/20 shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-[11px] leading-relaxed">
                    <div className="space-y-1 min-w-0">
                      <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-zinc-400 shrink-0" /> <span className="truncate">Procured By</span>
                      </p>
                      <p className="font-extrabold text-zinc-800 dark:text-zinc-200 truncate">{activeLightboxBill.branchName || "Main HQ"}</p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <Tag className="h-3 w-3 text-zinc-400 shrink-0" /> <span className="truncate">Supplier &amp; ID</span>
                      </p>
                      <p className="font-extrabold text-zinc-800 dark:text-zinc-200 truncate flex items-center gap-1.5 min-w-0">
                        <span className="truncate">{activeLightboxBill.supplierName || "Unknown Supplier"}</span>
                        <span className="text-[8px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-1 py-0.2 rounded shrink-0">
                          {activeLightboxBill.supplierId?.substring(0, 5).toUpperCase() || "LEG"}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <FileText className="h-3 w-3 text-zinc-400 shrink-0" /> <span className="truncate">Supplier Invoice ID</span>
                      </p>
                      <p className="font-mono font-extrabold text-zinc-800 dark:text-zinc-200 truncate">{activeLightboxBill.invoiceId || "N/A"}</p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-zinc-400 shrink-0" /> <span className="truncate">Date &amp; Time</span>
                      </p>
                      <p className="font-mono font-extrabold text-zinc-800 dark:text-zinc-200 truncate">
                        {activeLightboxBill.procurementDateTime 
                          ? new Date(activeLightboxBill.procurementDateTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) 
                          : activeLightboxBill.date
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Purchased Items Sub-Table (Glassmorphic & Semantic) */}
                <div className="space-y-2.5">
                  <span className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] block">Purchased Items Breakdown</span>
                  <div className="w-full overflow-x-auto no-scrollbar rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/20 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    <table className="min-w-full table-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                      <thead className="bg-zinc-100/50 dark:bg-zinc-900/30">
                        <tr className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          <th className="px-2 py-2.5 sm:px-4 text-left font-extrabold w-1/2 whitespace-nowrap">Product Description</th>
                          <th className="px-1.5 py-2.5 sm:px-3 text-center font-extrabold w-[10%] whitespace-nowrap">Qty</th>
                          <th className="px-2 py-2.5 sm:px-4 text-right font-extrabold w-1/4 whitespace-nowrap">Unit Cost</th>
                          <th className="px-2.5 py-2.5 sm:px-4 text-right font-extrabold w-1/4 whitespace-nowrap">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {activeLightboxBill.items?.map((it) => (
                          <tr key={it.id} className="text-[10px] hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10 transition-colors">
                            <td className="px-2 py-3 sm:px-4 text-left text-zinc-800 dark:text-zinc-200 min-w-[140px]">
                              <p className="font-extrabold truncate max-w-[140px] sm:max-w-none">{it.brandName} {it.modelName}</p>
                              <p className="text-[8px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5 truncate max-w-[140px] sm:max-w-none">S/N: {it.serial || "N/A"}</p>
                            </td>
                            <td className="px-1.5 py-3 sm:px-3 text-center font-mono font-extrabold text-zinc-700 dark:text-zinc-300">
                              {it.quantity}
                            </td>
                            <td className="px-2 py-3 sm:px-4 text-right font-mono font-bold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                              Rs. {Number(it.costPrice).toLocaleString()}
                            </td>
                            <td className="px-2.5 py-3 sm:px-4 text-right font-mono font-extrabold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                              Rs. {(Number(it.quantity) * Number(it.costPrice)).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-2.5">
                  <span className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] block">Advanced Financial Summary</span>
                  <div className="p-4.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/20 shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-[11px] space-y-3">
                    
                    <div className="flex justify-between items-center gap-4">
                      <span className="font-medium text-zinc-500 truncate">Total Cost Sum (LKR)</span>
                      <span className="font-mono font-black text-zinc-900 dark:text-zinc-100 text-xs shrink-0 whitespace-nowrap">
                        Rs. {(activeLightboxBill.totalBillAmount !== undefined ? activeLightboxBill.totalBillAmount : (activeLightboxBill.costPrice * activeLightboxBill.quantity)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center gap-4 border-t border-dashed border-zinc-200/80 dark:border-zinc-800/80 pt-3">
                      <span className="font-medium text-zinc-500 truncate">Advance Payment (LKR)</span>
                      <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0 whitespace-nowrap">
                        Rs. {(activeLightboxBill.advancePayment || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center gap-4 border-t border-dashed border-zinc-200/80 dark:border-zinc-800/80 pt-3">
                      <span className="font-medium text-zinc-500 truncate">Remaining Balance / Due (LKR)</span>
                      <span className={`font-mono font-black shrink-0 whitespace-nowrap ${activeLightboxBill.remainingBalance && activeLightboxBill.remainingBalance > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        Rs. {(activeLightboxBill.remainingBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center gap-4 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-3">
                      <span className="font-medium text-zinc-500 truncate">Settled Via (Payment Method)</span>
                      <span className="inline-flex items-center gap-1.5 font-extrabold text-zinc-700 dark:text-zinc-300 uppercase text-[9px] tracking-wider bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md shrink-0">
                        {activeLightboxBill.paymentMethod === "Bank Transfer" && <Landmark className="h-3 w-3 text-primary shrink-0" />}
                        {activeLightboxBill.paymentMethod === "Cheque" && <CreditCard className="h-3 w-3 text-primary shrink-0" />}
                        {activeLightboxBill.paymentMethod === "Cash" && <Banknote className="h-3 w-3 text-primary shrink-0" />}
                        {activeLightboxBill.paymentMethod === "Card" && <CreditCard className="h-3 w-3 text-primary shrink-0" />}
                        <span className="truncate">{activeLightboxBill.paymentMethod || "Cash"}</span>
                      </span>
                    </div>

                    {/* Conditional dynamic sub-rows */}
                    {activeLightboxBill.paymentMethod === "Card" && activeLightboxBill.cardTxRef && (
                      <div className="p-3 rounded-xl border border-zinc-200/60 bg-zinc-50/50 dark:bg-zinc-900/30 dark:border-zinc-800/80 text-[10px] space-y-1.5 animate-in slide-in-from-top-1">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-zinc-400 truncate">Card Network:</span>
                          <strong className="text-zinc-750 dark:text-zinc-200 shrink-0 whitespace-nowrap">{activeLightboxBill.cardType || "Visa"}</strong>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-zinc-400 truncate">Transaction Ref:</span>
                          <strong className="text-zinc-750 dark:text-zinc-200 font-mono shrink-0 whitespace-nowrap">{activeLightboxBill.cardTxRef}</strong>
                        </div>
                      </div>
                    )}

                    {activeLightboxBill.paymentMethod === "Cheque" && activeLightboxBill.chequeNumber && (
                      <div className="p-3 rounded-xl border border-zinc-200/60 bg-zinc-50/50 dark:bg-zinc-900/30 dark:border-zinc-800/80 text-[10px] space-y-1.5 animate-in slide-in-from-top-1">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-zinc-400 truncate">Cheque Number:</span>
                          <strong className="text-zinc-750 dark:text-zinc-200 font-mono shrink-0 whitespace-nowrap">{activeLightboxBill.chequeNumber}</strong>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-zinc-400 truncate">Cheque Due Date:</span>
                          <strong className="text-zinc-750 dark:text-zinc-200 font-mono shrink-0 whitespace-nowrap">{activeLightboxBill.chequeDate}</strong>
                        </div>
                      </div>
                    )}

                    {activeLightboxBill.paymentMethod === "Bank Transfer" && activeLightboxBill.bankTxRef && (
                      <div className="p-3 rounded-xl border border-zinc-200/60 bg-zinc-50/50 dark:bg-zinc-900/30 dark:border-zinc-800/80 text-[10px] space-y-1.5 animate-in slide-in-from-top-1">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-zinc-400 truncate">Bank Reference:</span>
                          <strong className="text-zinc-750 dark:text-zinc-200 font-mono shrink-0 whitespace-nowrap">{activeLightboxBill.bankTxRef}</strong>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-zinc-400 truncate">Account Number:</span>
                          <strong className="text-zinc-750 dark:text-zinc-200 font-mono shrink-0 whitespace-nowrap">{activeLightboxBill.bankAccount}</strong>
                        </div>
                      </div>
                    )}

                    {activeLightboxBill.discrepancyNotes && (
                      <div className="p-3 rounded-xl border border-amber-100/50 bg-amber-50/30 text-[10px] text-amber-800 space-y-1.5 dark:bg-amber-950/10 dark:border-amber-900/55 dark:text-amber-400 mt-2">
                        <p className="font-bold flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" /> <span className="truncate">Discrepancy / Damage Notes</span>
                        </p>
                        <p className="font-medium leading-relaxed break-words">{activeLightboxBill.discrepancyNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Action Status Pill */}
              <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 pt-5 mt-6 shrink-0">
                <span className={`w-full text-center py-3.5 rounded-2xl border font-black uppercase text-[10px] tracking-[0.2em] block transition-all shadow-sm ${
                  activeLightboxBill.paymentStatus === "Fully Paid" 
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-600 text-white shadow-emerald-500/10" 
                    : activeLightboxBill.paymentStatus === "Partially Paid"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-600 text-white shadow-amber-500/10"
                      : "bg-gradient-to-r from-rose-500 to-red-600 border-rose-600 text-white shadow-rose-500/10"
                }`}>
                  PAYMENT: {activeLightboxBill.paymentStatus ? activeLightboxBill.paymentStatus.toUpperCase() : "FULLY PAID"}
                </span>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
